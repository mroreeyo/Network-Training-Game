// 챕터 1(패킷 택배) 스테이지 데이터다. 스테이지 추가 = 이 파일에 객체 추가.
// MAC 주소는 장비를 구분하기 쉬운 학습용 값이다. 형식은 실제 MAC 주소와 같다.
//
// 스테이지 모양
//   number: 스테이지 번호. 목록에서의 순서와 같아야 한다 (packetStages.test.js가 확인한다).
//   title, goal: 작업 지시서에 보이는 제목과 목표. 목표에는 써야 할 포트 번호를 적는다.
//   hints: 힌트 최대 2단계.
//   deliveries: 차례로 보낼 배송 목록. 대부분 1건이다.
//   arrived: 받는 쪽 스테이지에만 있다. 도착한 상자 { destinationName, payload, labels } (deliveries 대신 쓴다).
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
const SERVER_B = { name: '서버 B', ports: [{ ip: '10.0.0.20', mac: 'BB:BB:BB:00:00:0B' }] };

// ---------- 모든 스테이지가 같이 쓰는 카드 만들기 ----------
function makeTransportCard(id, protocol, destinationPort) {
  return { id, layer: 'L4', values: { protocol, destinationPort } };
}

function makeIpCard(id, sourceIp, destinationIp) {
  return { id, layer: 'L3', values: { sourceIp, destinationIp } };
}

function makeEthernetCard(id, sourceMac, destinationMac) {
  return { id, layer: 'L2', values: { sourceMac, destinationMac } };
}

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
        makeEthernetCard('eth-a-b', 'AA:AA:AA:00:00:0A', 'CC:CC:CC:00:00:0C'),
        makeTransportCard('tcp-8080', 'TCP', 8080),
        makeIpCard('ip-a-b', '192.168.0.10', '192.168.0.20'),
      ],
    },
  ],
};

// ---------- 스테이지 2: 라우터 1대 ----------
// 오답 카드는 흔한 오해를 하나씩 담는다: 목적지 IP에 라우터 IP, 목적지 MAC에 최종 목적지 MAC,
// 출발지와 목적지 뒤바뀜, 라우터를 지난 뒤 이전 구간의 MAC, 라우터의 들어오는 쪽 포트 MAC.
const oneRouterDelivery = {
  application: '파일 전송',
  payload: '파일 조각',
  sourceIp: '192.168.0.10',
  destinationIp: '10.0.0.20',
  routerIps: ['192.168.0.1', '10.0.0.1'],
  transport: { protocol: 'TCP', destinationPort: 443 },
  transportReason: '',
  stops: [
    PC_A,
    {
      name: '라우터 R1',
      ports: [
        { label: '왼쪽', ip: '192.168.0.1', mac: '11:11:11:00:00:01' },
        { label: '오른쪽', ip: '10.0.0.1', mac: '11:11:11:00:00:02' },
      ],
    },
    SERVER_B,
  ],
  segments: [
    { label: '구간 1', sourceMac: 'AA:AA:AA:00:00:0A', destinationMac: '11:11:11:00:00:01' },
    { label: '구간 2', sourceMac: '11:11:11:00:00:02', destinationMac: 'BB:BB:BB:00:00:0B' },
  ],
  steps: [
    {
      prompt: 'L4 헤더와 L3 헤더를 붙여요. 최종 목적지는 서버 B예요.',
      layers: ['L4', 'L3'],
      segmentIndex: 0,
      tray: [
        makeIpCard('ip-to-router', '192.168.0.10', '192.168.0.1'),
        makeTransportCard('tcp-443', 'TCP', 443),
        makeIpCard('ip-a-server-b', '192.168.0.10', '10.0.0.20'),
      ],
    },
    {
      prompt: '구간 1(PC A에서 라우터 R1까지)의 L2 헤더를 붙여요.',
      layers: ['L2'],
      segmentIndex: 0,
      tray: [
        makeEthernetCard('eth-swapped', '11:11:11:00:00:01', 'AA:AA:AA:00:00:0A'),
        makeEthernetCard('eth-to-final', 'AA:AA:AA:00:00:0A', 'BB:BB:BB:00:00:0B'),
        makeEthernetCard('eth-segment-1', 'AA:AA:AA:00:00:0A', '11:11:11:00:00:01'),
      ],
    },
    {
      prompt: '상자가 라우터 R1에 도착해서 L2 헤더가 떼어졌어요. 구간 2(라우터 R1에서 서버 B까지)의 L2 헤더를 새로 붙여요.',
      layers: ['L2'],
      segmentIndex: 1,
      tray: [
        makeEthernetCard('eth-segment-1-again', 'AA:AA:AA:00:00:0A', '11:11:11:00:00:01'),
        makeEthernetCard('eth-segment-2', '11:11:11:00:00:02', 'BB:BB:BB:00:00:0B'),
        makeEthernetCard('eth-wrong-port', '11:11:11:00:00:01', 'BB:BB:BB:00:00:0B'),
      ],
    },
  ],
};

// ---------- 스테이지 3: TCP와 UDP ----------
// 같은 네트워크 안에서 보내서 L4 고르기에 집중한다. 두 카드의 포트는 같고 전송 방식만 다르다.
function makeTransportChoiceDelivery(application, payload, transport, transportReason, transportCards) {
  return {
    application,
    payload,
    sourceIp: '192.168.0.10',
    destinationIp: '192.168.0.20',
    routerIps: [],
    transport,
    transportReason,
    stops: [PC_A, PC_B],
    segments: [{ label: '구간 1', sourceMac: 'AA:AA:AA:00:00:0A', destinationMac: 'CC:CC:CC:00:00:0C' }],
    steps: [
      {
        prompt: `${application}에 맞는 L4 헤더를 골라 붙여요.`,
        layers: ['L4'],
        segmentIndex: 0,
        tray: transportCards,
      },
      {
        prompt: '이어서 L3 헤더와 L2 헤더를 순서대로 붙여요.',
        layers: ['L3', 'L2'],
        segmentIndex: 0,
        tray: [
          makeEthernetCard('eth-a-b', 'AA:AA:AA:00:00:0A', 'CC:CC:CC:00:00:0C'),
          makeIpCard('ip-a-b', '192.168.0.10', '192.168.0.20'),
        ],
      },
    ],
  };
}

const videoCallDelivery = makeTransportChoiceDelivery(
  '영상 통화',
  '영상 조각',
  { protocol: 'UDP', destinationPort: 5004 },
  '영상 통화는 조각이 조금 빠져도 이어지는 편이 낫고, TCP가 빠진 조각을 다시 받는 동안 화면이 멈춰요.',
  [makeTransportCard('tcp-5004', 'TCP', 5004), makeTransportCard('udp-5004', 'UDP', 5004)],
);

const fileTransferDelivery = makeTransportChoiceDelivery(
  '파일 전송',
  '파일 조각',
  { protocol: 'TCP', destinationPort: 443 },
  '파일은 한 조각만 빠져도 열리지 않아서, 도착을 확인하고 빠진 조각을 다시 보내는 TCP가 필요해요.',
  [makeTransportCard('udp-443', 'UDP', 443), makeTransportCard('tcp-443', 'TCP', 443)],
);

// ---------- 스테이지 4: 라우터 2대 ----------
const twoRouterDelivery = {
  application: '웹 요청',
  payload: '웹 요청',
  sourceIp: '192.168.0.10',
  destinationIp: '10.0.0.20',
  routerIps: ['192.168.0.1', '172.16.0.1', '172.16.0.2', '10.0.0.1'],
  transport: { protocol: 'TCP', destinationPort: 443 },
  transportReason: '',
  stops: [
    PC_A,
    {
      name: '라우터 R1',
      ports: [
        { label: '왼쪽', ip: '192.168.0.1', mac: '11:11:11:00:00:01' },
        { label: '오른쪽', ip: '172.16.0.1', mac: '11:11:11:00:00:02' },
      ],
    },
    {
      name: '라우터 R2',
      ports: [
        { label: '왼쪽', ip: '172.16.0.2', mac: '22:22:22:00:00:01' },
        { label: '오른쪽', ip: '10.0.0.1', mac: '22:22:22:00:00:02' },
      ],
    },
    // 서버 B와 주소가 같은 장비라서 이름만 바꿔 쓴다.
    { ...SERVER_B, name: '웹 서버' },
  ],
  segments: [
    { label: '구간 1', sourceMac: 'AA:AA:AA:00:00:0A', destinationMac: '11:11:11:00:00:01' },
    { label: '구간 2', sourceMac: '11:11:11:00:00:02', destinationMac: '22:22:22:00:00:01' },
    { label: '구간 3', sourceMac: '22:22:22:00:00:02', destinationMac: 'BB:BB:BB:00:00:0B' },
  ],
  steps: [
    {
      prompt: 'L4 헤더와 L3 헤더를 붙여요. 최종 목적지는 웹 서버예요.',
      layers: ['L4', 'L3'],
      segmentIndex: 0,
      tray: [
        makeTransportCard('tcp-443', 'TCP', 443),
        makeIpCard('ip-to-router', '192.168.0.10', '172.16.0.2'),
        makeIpCard('ip-a-web', '192.168.0.10', '10.0.0.20'),
      ],
    },
    {
      prompt: '구간 1(PC A에서 라우터 R1까지)의 L2 헤더를 붙여요.',
      layers: ['L2'],
      segmentIndex: 0,
      tray: [
        makeEthernetCard('eth-to-final', 'AA:AA:AA:00:00:0A', 'BB:BB:BB:00:00:0B'),
        makeEthernetCard('eth-segment-1', 'AA:AA:AA:00:00:0A', '11:11:11:00:00:01'),
        makeEthernetCard('eth-swapped', '11:11:11:00:00:01', 'AA:AA:AA:00:00:0A'),
      ],
    },
    {
      prompt: '상자가 라우터 R1에 도착했어요. 구간 2(라우터 R1에서 라우터 R2까지)의 L2 헤더를 새로 붙여요.',
      layers: ['L2'],
      segmentIndex: 1,
      tray: [
        makeEthernetCard('eth-segment-2', '11:11:11:00:00:02', '22:22:22:00:00:01'),
        makeEthernetCard('eth-segment-1-again', 'AA:AA:AA:00:00:0A', '11:11:11:00:00:01'),
        makeEthernetCard('eth-r1-to-final', '11:11:11:00:00:02', 'BB:BB:BB:00:00:0B'),
      ],
    },
    {
      prompt: '상자가 라우터 R2에 도착했어요. 구간 3(라우터 R2에서 웹 서버까지)의 L2 헤더를 새로 붙여요.',
      layers: ['L2'],
      segmentIndex: 2,
      tray: [
        makeEthernetCard('eth-segment-2-again', '11:11:11:00:00:02', '22:22:22:00:00:01'),
        makeEthernetCard('eth-wrong-port', '22:22:22:00:00:01', 'BB:BB:BB:00:00:0B'),
        makeEthernetCard('eth-segment-3', '22:22:22:00:00:02', 'BB:BB:BB:00:00:0B'),
      ],
    },
  ],
};

// ---------- 스테이지 5: 받는 쪽 (역캡슐화) ----------
// 스테이지 2에서 서버 B로 보낸 상자가 도착한 모습이다. 마지막 구간의 L2 헤더가 붙어 있다.
// 목록은 붙인 순서(L4가 맨 안쪽)로 적는다. 화면은 바깥(L2)이 위에 보이게 뒤집어 쌓는다.
// 주소를 스테이지 2 배송에서 가져오는 이유: 스테이지 2의 주소를 고쳐도 도착한 상자가 함께 바뀌게 하려는 것이다.
const lastSegmentToServerB = oneRouterDelivery.segments[oneRouterDelivery.segments.length - 1];
const arrivedAtServerB = {
  destinationName: SERVER_B.name,
  payload: oneRouterDelivery.payload,
  labels: [
    makeTransportCard('arrived-l4', oneRouterDelivery.transport.protocol, oneRouterDelivery.transport.destinationPort),
    makeIpCard('arrived-l3', oneRouterDelivery.sourceIp, oneRouterDelivery.destinationIp),
    makeEthernetCard('arrived-l2', lastSegmentToServerB.sourceMac, lastSegmentToServerB.destinationMac),
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
  {
    number: 2,
    title: '라우터 1대를 거쳐 보내기',
    goal: 'PC A의 파일 조각을 서버 B까지 보내요. 파일 전송은 TCP 443번 포트를 써요. 라우터를 지날 때마다 L2 헤더를 새로 붙여야 해요.',
    hints: [
      'IP 헤더의 목적지는 라우터가 아니라 최종 목적지(서버 B)예요.',
      '라우터를 지나면 L2 헤더가 떼어져요. 구간 2의 출발지 MAC은 라우터 R1의 오른쪽 MAC이에요.',
    ],
    deliveries: [oneRouterDelivery],
    successSummary: '배송 완료. 라우터에서 L2 헤더를 새로 붙였고, IP 주소는 끝까지 그대로였어요.',
  },
  {
    number: 3,
    title: 'TCP와 UDP 중 맞는 것을 골라 보내기',
    goal: '영상 통화(5004번 포트)와 파일 전송(443번 포트)을 차례로 보내요. 각각에 맞는 L4 헤더를 골라요.',
    hints: [
      'TCP는 도착을 확인하고 빠진 조각을 다시 보내요. UDP는 확인 없이 바로 보내요.',
      '조금 빠져도 끊기지 않는 것이 중요하면 UDP, 하나도 빠지면 안 되면 TCP예요.',
    ],
    deliveries: [videoCallDelivery, fileTransferDelivery],
    successSummary: '배송 완료. 영상 통화는 UDP, 파일 전송은 TCP로 보냈어요.',
  },
  {
    number: 4,
    title: '라우터 2대를 거쳐 웹 서버까지 보내기',
    goal: 'PC A의 웹 요청을 라우터 2대를 거쳐 웹 서버까지 보내요. 웹 요청은 TCP 443번 포트를 써요. 구간이 3개라서 L2 헤더를 3번 붙여요.',
    hints: [
      '구간마다 출발지 MAC은 상자를 내보내는 장비, 목적지 MAC은 바로 다음 장비예요. 라우터라면 상자가 나가는 쪽 포트의 MAC이 출발지예요.',
      'IP 헤더와 L4 헤더는 한 번만 붙이고, 라우터를 지날 때마다 L2 헤더만 새로 붙여요.',
    ],
    deliveries: [twoRouterDelivery],
    successSummary: '배송 완료. 라우터를 두 번 지나며 L2 헤더를 새로 붙였고, IP 헤더는 끝까지 그대로였어요.',
  },
  {
    number: 5,
    title: '도착한 패킷에서 원래 데이터 꺼내기',
    goal: '서버 B에 도착한 상자에서 헤더를 벗겨 원래 데이터를 꺼내요. 받는 쪽은 보내는 쪽과 반대 순서로 벗겨요.',
    hints: [
      '받는 쪽에서는 가장 바깥에 붙은 헤더부터 벗겨요. 보낼 때 가장 나중에 붙인 헤더예요.',
      '가장 바깥은 L2예요. L2, L3, L4 순서로 벗기면 데이터가 나와요.',
    ],
    arrived: arrivedAtServerB,
    successSummary: '데이터를 꺼냈어요. L2, L3, L4 순서로 바깥부터 벗겼어요.',
  },
];
