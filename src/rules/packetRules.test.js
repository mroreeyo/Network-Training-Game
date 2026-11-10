// [라이브러리] vitest: 챕터 1 규칙을 화면 없이 테스트한다 (자세한 이유는 scripts/tokenRules.test.js)
import { describe, expect, it } from 'vitest';
import {
  checkHeaderOrder,
  classifyLinkHeader,
  classifyNetworkHeader,
  classifyTransportHeader,
  advanceAfterPass,
  judgePeel,
  judgeStep,
  stripLinkHeader,
} from './packetRules.js';

const delivery = {
  application: '파일 전송',
  sourceIp: '192.168.0.10',
  destinationIp: '10.0.0.20',
  routerIps: ['192.168.0.1'],
  transport: { protocol: 'TCP', destinationPort: 443 },
  transportReason: '손실 없이 모두 도착해야 해요.',
  segments: [
    { sourceMac: 'AA:0A', destinationMac: '11:01' },
    { sourceMac: '11:02', destinationMac: 'BB:0B' },
  ],
};

const tcp = { layer: 'L4', values: { protocol: 'TCP', destinationPort: 443 } };
const udp = { layer: 'L4', values: { protocol: 'UDP', destinationPort: 443 } };
const tcpWrongPort = { layer: 'L4', values: { protocol: 'TCP', destinationPort: 8080 } };
const ip = { layer: 'L3', values: { sourceIp: '192.168.0.10', destinationIp: '10.0.0.20' } };
const ipToRouter = { layer: 'L3', values: { sourceIp: '192.168.0.10', destinationIp: '192.168.0.1' } };
const eth1 = { layer: 'L2', values: { sourceMac: 'AA:0A', destinationMac: '11:01' } };
const eth2 = { layer: 'L2', values: { sourceMac: '11:02', destinationMac: 'BB:0B' } };

describe('checkHeaderOrder', () => {
  it('L4, L3, L2 순서면 통과', () => {
    expect(checkHeaderOrder([tcp, ip, eth1], ['L4', 'L3', 'L2']).passed).toBe(true);
  });
  it('L2를 먼저 붙이면 반송', () => {
    const result = checkHeaderOrder([eth1, ip, tcp], ['L4', 'L3', 'L2']);
    expect(result.passed).toBe(false);
    expect(result.reason.why).toContain('L2 헤더를 L4 헤더보다 먼저');
  });
  it('헤더가 빠졌으면 반송', () => {
    const result = checkHeaderOrder([tcp, ip], ['L4', 'L3', 'L2']);
    expect(result.reason.why).toContain('L2 헤더가 빠진');
  });
  it('같은 계층을 두 장 붙이면 순서가 아니라 빠진 헤더를 알려 준다', () => {
    const result = checkHeaderOrder([tcp, ip, ipToRouter], ['L4', 'L3', 'L2']);
    expect(result.passed).toBe(false);
    expect(result.reason.why).toContain('L2 헤더가 빠진');
  });
  it('필요한 것보다 많이 붙이면 반송', () => {
    const result = checkHeaderOrder([tcp, ip, eth1], ['L4', 'L3']);
    expect(result.passed).toBe(false);
    expect(result.reason.why).toContain('2장이 필요한데 3장');
  });
});

describe('카드 분류', () => {
  it('전송 방식과 포트를 구분한다', () => {
    expect(classifyTransportHeader(tcp, delivery.transport)).toBe('correct');
    expect(classifyTransportHeader(udp, delivery.transport)).toBe('wrong-protocol');
    expect(classifyTransportHeader(tcpWrongPort, delivery.transport)).toBe('wrong-port');
  });
  it('출발지와 목적지 IP가 바뀌었거나 경로와 다른 카드를 알아본다', () => {
    const swapped = { layer: 'L3', values: { sourceIp: '10.0.0.20', destinationIp: '192.168.0.10' } };
    const unrelated = { layer: 'L3', values: { sourceIp: '192.168.0.10', destinationIp: '10.0.0.99' } };
    expect(classifyNetworkHeader(swapped, delivery)).toBe('swapped');
    expect(classifyNetworkHeader(unrelated, delivery)).toBe('other');
  });
  it('목적지 IP를 라우터 IP로 적은 카드를 알아본다', () => {
    expect(classifyNetworkHeader(ip, delivery)).toBe('correct');
    expect(classifyNetworkHeader(ipToRouter, delivery)).toBe('router-as-destination');
  });
  it('L2는 구간마다 다르다', () => {
    expect(classifyLinkHeader(eth1, delivery, 0)).toBe('correct');
    expect(classifyLinkHeader(eth1, delivery, 1)).toBe('previous-segment');
    expect(classifyLinkHeader(eth2, delivery, 1)).toBe('correct');
  });
  it('첫 구간에 최종 목적지 MAC을 쓰면 알아본다', () => {
    const card = { layer: 'L2', values: { sourceMac: 'AA:0A', destinationMac: 'BB:0B' } };
    expect(classifyLinkHeader(card, delivery, 0)).toBe('final-destination');
  });
  it('마지막 구간에서 목적지가 최종 서버 MAC이어도 출발지가 맞으면 정상', () => {
    expect(classifyLinkHeader(eth2, delivery, 1)).toBe('correct');
  });
  it('출발지 MAC만 틀린 카드를 알아본다', () => {
    const card = { layer: 'L2', values: { sourceMac: '11:01', destinationMac: 'BB:0B' } };
    expect(classifyLinkHeader(card, delivery, 1)).toBe('wrong-source');
  });
  it('출발지와 목적지가 바뀐 카드를 알아본다', () => {
    const card = { layer: 'L2', values: { sourceMac: '11:01', destinationMac: 'AA:0A' } };
    expect(classifyLinkHeader(card, delivery, 0)).toBe('swapped');
  });
  it('두 구간 전의 MAC을 다시 써도 이전 구간 MAC으로 알아본다', () => {
    const threeSegments = {
      segments: [
        { sourceMac: 'AA:0A', destinationMac: '11:01' },
        { sourceMac: '11:02', destinationMac: '22:01' },
        { sourceMac: '22:02', destinationMac: 'BB:0B' },
      ],
    };
    expect(classifyLinkHeader(eth1, threeSegments, 2)).toBe('previous-segment');
  });
});

describe('judgeStep', () => {
  const firstStep = { layers: ['L4', 'L3'], segmentIndex: 0 };
  it('맞게 붙이면 통과', () => {
    expect(judgeStep(firstStep, [tcp, ip], delivery).passed).toBe(true);
  });
  it('UDP를 붙이면 이유와 붙인 값을 돌려준다', () => {
    const result = judgeStep(firstStep, [udp, ip], delivery);
    expect(result.reason.why).toContain('파일 전송에는 TCP');
    expect(result.record.rows).toContainEqual(['목적지 포트', '443']);
  });
  it('전송 방식의 이유 문장이 없으면 이유 없이 끝난다', () => {
    const result = judgeStep(firstStep, [udp, ip], { ...delivery, transportReason: '' });
    expect(result.reason.why).toBe('파일 전송에는 TCP가 맞는데 UDP를 붙였어요.');
  });
  it('포트가 틀리면 붙인 포트는 알려 주고 맞는 포트는 알려 주지 않는다', () => {
    const result = judgeStep(firstStep, [tcpWrongPort, ip], delivery);
    expect(result.reason.why).toBe('목적지 포트 8080번은 파일 전송에서 쓰는 포트가 아니에요.');
    expect(JSON.stringify(result.reason)).not.toContain('443');
  });
  it('라우터 IP를 목적지로 쓰면 반송', () => {
    const result = judgeStep(firstStep, [tcp, ipToRouter], delivery);
    expect(result.reason.why).toContain('라우터 IP');
  });
  it('라우터를 지난 뒤 이전 MAC을 쓰면 PRD 문구대로 반송', () => {
    const result = judgeStep({ layers: ['L2'], segmentIndex: 1 }, [eth1], delivery);
    expect(result.reason.why).toBe('라우터를 지났는데 이전 구간의 MAC 주소가 그대로예요.');
    expect(result.record.title).toBe('붙인 L2 이더넷 헤더');
  });
  it('둘째 구간의 올바른 L2는 통과', () => {
    expect(judgeStep({ layers: ['L2'], segmentIndex: 1 }, [eth2], delivery).passed).toBe(true);
  });
});

describe('라우터와 역캡슐화', () => {
  it('라우터를 지나면 L2만 떼어진다', () => {
    expect(stripLinkHeader([tcp, ip, eth1])).toEqual([tcp, ip]);
  });
  it('바깥부터 벗기면 통과, 안쪽부터면 반송', () => {
    expect(judgePeel(['L2', 'L3', 'L4'], 'L2').passed).toBe(true);
    const result = judgePeel(['L2', 'L3', 'L4'], 'L4');
    expect(result.passed).toBe(false);
    expect(result.reason.why).toContain('가장 바깥에 있는 헤더는 L2');
  });
  it('남은 헤더가 붙인 순서(L4가 맨 앞)로 넘어와도 바깥은 L2다', () => {
    expect(judgePeel(['L4', 'L3', 'L2'], 'L2').passed).toBe(true);
    expect(judgePeel(['L4', 'L3'], 'L4').passed).toBe(false);
  });
  it('벗길 헤더가 없으면 undefined를 문구에 넣지 않는다', () => {
    const result = judgePeel([], 'L2');
    expect(result.passed).toBe(false);
    expect(result.reason.why).not.toContain('undefined');
  });
});

describe('advanceAfterPass', () => {
  const twoSegments = { steps: [{}, {}, {}] };
  it('다음 작업으로 넘어갈 때 L2 헤더를 뗀다', () => {
    const next = advanceAfterPass({
      labels: [tcp, ip], attached: [eth1], delivery: twoSegments, stepIndex: 1, deliveryIndex: 0, deliveryCount: 1,
    });
    expect(next).toEqual({ kind: 'next-step', labels: [tcp, ip], stepIndex: 2, deliveryIndex: 0 });
  });
  it('마지막 작업이면 다음 배송으로, 없으면 끝', () => {
    const base = { labels: [], attached: [], delivery: twoSegments, stepIndex: 2 };
    expect(advanceAfterPass({ ...base, deliveryIndex: 0, deliveryCount: 2 }).kind).toBe('next-delivery');
    expect(advanceAfterPass({ ...base, deliveryIndex: 1, deliveryCount: 2 }).kind).toBe('finished');
  });
});
