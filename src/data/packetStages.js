// 챕터 1(패킷 택배) 스테이지 데이터다. 스테이지 추가 = 이 파일에 객체 추가.
// MAC 주소는 장비를 구분하기 쉬운 학습용 값이다. 형식은 실제 MAC 주소와 같다.
//
// 스테이지 모양
//   number: 스테이지 번호. 목록에서의 순서와 같아야 한다 (packetStages.test.js가 확인한다).
//   title, goal: 작업 지시서에 보이는 제목과 목표. 목표에는 써야 할 포트 번호를 적는다.
//   hints: 힌트 최대 2단계.
//   deliveries: 차례로 보낼 배송 목록. 대부분 1건이다.
//   successSummary: 통과했을 때 결과 화면에 보이는 문장.
//
// 배송(delivery) 모양은 src/rules/packetRules.js 맨 위에 적혀 있다. 화면용으로 아래 값이 더 있다.
//   payload: 상자 안의 데이터 이름
//   stops: 경로 표에 그릴 장비 목록. 장비마다 { name, ports: [{ label?, ip, mac }] }
//   segments[].label: 구간 이름
//   steps[].prompt: 이번 작업에서 할 일을 알려 주는 문장
//   steps[].tray: 부품 트레이에 놓이는 카드. 한 번에 3장 이하로 둔다 (0단계 검수 기록 결정 E).

const PC_A = { name: 'PC A', ports: [{ ip: '192.168.0.10', mac: 'AA:AA:AA:00:00:0A' }] };
const PC_B = { name: 'PC B', ports: [{ ip: '192.168.0.20', mac: 'CC:CC:CC:00:00:0C' }] };

// ---------- 스테이지 1: 같은 네트워크 ----------
// 트레이의 카드 순서는 정답 순서(L4, L3, L2)와 다르게 섞어 둔다. 순서를 스스로 정해야 하기 때문이다.
const sameNetworkDelivery = {
  application: '메신저',
  payload: '메시지',
  sourceIp: '192.168.0.10',
  destinationIp: '192.168.0.20',
  routerIps: [],
  transport: { protocol: 'TCP', destinationPort: 8080 },
  transportReason: '',
  stops: [PC_A, PC_B],
  segments: [{ label: '구간 1', sourceMac: 'AA:AA:AA:00:00:0A', destinationMac: 'CC:CC:CC:00:00:0C' }],
  steps: [
    {
      prompt: 'PC A가 PC B에게 보낼 상자에 L4, L3, L2 헤더를 순서대로 붙여요.',
      layers: ['L4', 'L3', 'L2'],
      segmentIndex: 0,
      tray: [
        { id: 'eth-a-b', layer: 'L2', values: { sourceMac: 'AA:AA:AA:00:00:0A', destinationMac: 'CC:CC:CC:00:00:0C' } },
        { id: 'tcp-8080', layer: 'L4', values: { protocol: 'TCP', destinationPort: 8080 } },
        { id: 'ip-a-b', layer: 'L3', values: { sourceIp: '192.168.0.10', destinationIp: '192.168.0.20' } },
      ],
    },
  ],
};

export const packetStages = [
  {
    number: 1,
    title: '같은 네트워크 안의 PC에게 보내기',
    goal: 'PC A의 메신저 메시지를 같은 네트워크의 PC B에게 보내요. 메신저는 TCP 8080번 포트를 써요. 헤더 3장을 L4, L3, L2 순서로 붙여요.',
    hints: [
      '헤더는 안쪽부터 붙여요. 데이터에 가장 먼저 붙는 것은 L4 헤더예요.',
      'L4, L3, L2 순서로 붙이면 L2가 가장 바깥에 와요. L2의 출발지는 PC A, 목적지는 PC B의 MAC이에요.',
    ],
    deliveries: [sameNetworkDelivery],
    successSummary: '배송 완료. 헤더를 L4, L3, L2 순서로 붙였어요.',
  },
];
