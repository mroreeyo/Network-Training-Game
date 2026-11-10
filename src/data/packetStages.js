// 챕터 1(패킷 택배) 스테이지 데이터다. 스테이지 추가 = 이 파일에 객체 추가.
// MAC 주소는 장비를 구분하기 쉬운 학습용 값이다. 형식은 실제 MAC 주소와 같다.
//
// 용어
//   step: 상자에 헤더를 붙이는 한 번의 작업. layers는 이 step에서 붙일 헤더 계층(붙이는 순서)이다.
//   tray: 부품 트레이에 놓이는 카드. 한 번에 3장 이하로 둔다 (0단계 검수 기록 결정 E).
//   segmentIndex: 이 step이 몇 번째 구간(0부터)의 L2 헤더를 쓰는지

const PC_A = { name: 'PC A', ports: [{ ip: '192.168.0.10', mac: 'AA:AA:AA:00:00:0A' }] };

// ---------- 자주 쓰는 카드 ----------
const tcp443 = { id: 'tcp-443', layer: 'L4', values: { protocol: 'TCP', destinationPort: 443 } };
const udp443 = { id: 'udp-443', layer: 'L4', values: { protocol: 'UDP', destinationPort: 443 } };
const tcp5004 = { id: 'tcp-5004', layer: 'L4', values: { protocol: 'TCP', destinationPort: 5004 } };
const udp5004 = { id: 'udp-5004', layer: 'L4', values: { protocol: 'UDP', destinationPort: 5004 } };
const tcp8080 = { id: 'tcp-8080', layer: 'L4', values: { protocol: 'TCP', destinationPort: 8080 } };

function makeIpCard(id, sourceIp, destinationIp) {
  return { id, layer: 'L3', values: { sourceIp, destinationIp } };
}

function makeEthernetCard(id, sourceMac, destinationMac) {
  return { id, layer: 'L2', values: { sourceMac, destinationMac } };
}

// ---------- 스테이지 1: 같은 네트워크 ----------
const sameNetworkDelivery = {
  application: '메신저 메시지',
  payload: '메시지',
  sourceIp: '192.168.0.10',
  destinationIp: '192.168.0.20',
  routerIps: [],
  transport: { protocol: 'TCP', destinationPort: 8080 },
  transportReason: '',
  stops: [
    PC_A,
    { name: 'PC B', ports: [{ ip: '192.168.0.20', mac: 'CC:CC:CC:00:00:0C' }] },
  ],
  segments: [{ label: '구간 1', sourceMac: 'AA:AA:AA:00:00:0A', destinationMac: 'CC:CC:CC:00:00:0C' }],
  steps: [
    {
      prompt: 'PC A가 PC B에게 보낼 상자에 L4, L3, L2 헤더를 순서대로 붙여요.',
      layers: ['L4', 'L3', 'L2'],
      segmentIndex: 0,
      tray: [
        makeEthernetCard('eth-1', 'AA:AA:AA:00:00:0A', 'CC:CC:CC:00:00:0C'),
        tcp8080,
        makeIpCard('ip-ab', '192.168.0.10', '192.168.0.20'),
      ],
    },
  ],
};

// ---------- 스테이지 2: 라우터 1대 ----------
const R1_LEFT = { label: '왼쪽', ip: '192.168.0.1', mac: '11:11:11:00:00:01' };
const SERVER_B = { name: '서버 B', ports: [{ ip: '10.0.0.20', mac: 'BB:BB:BB:00:00:0B' }] };

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
    { name: '라우터 R1', ports: [R1_LEFT, { label: '오른쪽', ip: '10.0.0.1', mac: '11:11:11:00:00:02' }] },
    SERVER_B,
  ],
  segments: [
    { label: '구간 1', sourceMac: 'AA:AA:AA:00:00:0A', destinationMac: '11:11:11:00:00:01' },
    { label: '구간 2', sourceMac: '11:11:11:00:00:02', destinationMac: 'BB:BB:BB:00:00:0B' },
  ],
  steps: [
    {
      prompt: 'L4 헤더와 L3 헤더를 붙여요. 목적지는 서버 B예요.',
      layers: ['L4', 'L3'],
      segmentIndex: 0,
      tray: [
        makeIpCard('ip-to-router', '192.168.0.10', '192.168.0.1'),
        tcp443,
        makeIpCard('ip-ab', '192.168.0.10', '10.0.0.20'),
      ],
    },
    {
      prompt: '구간 1(PC A에서 라우터 R1까지)의 L2 헤더를 붙여요.',
      layers: ['L2'],
      segmentIndex: 0,
      tray: [
        makeEthernetCard('eth-swapped', '11:11:11:00:00:01', 'AA:AA:AA:00:00:0A'),
        makeEthernetCard('eth-final', 'AA:AA:AA:00:00:0A', 'BB:BB:BB:00:00:0B'),
        makeEthernetCard('eth-1', 'AA:AA:AA:00:00:0A', '11:11:11:00:00:01'),
      ],
    },
    {
      prompt: '구간 2(라우터 R1에서 서버 B까지)의 L2 헤더를 새로 붙여요.',
      layers: ['L2'],
      segmentIndex: 1,
      tray: [
        makeEthernetCard('eth-1-again', 'AA:AA:AA:00:00:0A', '11:11:11:00:00:01'),
        makeEthernetCard('eth-2', '11:11:11:00:00:02', 'BB:BB:BB:00:00:0B'),
        makeEthernetCard('eth-wrong-port', '11:11:11:00:00:01', 'BB:BB:BB:00:00:0B'),
      ],
    },
  ],
};

// ---------- 스테이지 3: TCP와 UDP ----------
function makeTransportDelivery(application, payload, transport, reason, protocolCards) {
  return {
    application,
    payload,
    sourceIp: '192.168.0.10',
    destinationIp: '192.168.0.20',
    routerIps: [],
    transport,
    transportReason: reason,
    stops: sameNetworkDelivery.stops,
    segments: sameNetworkDelivery.segments,
    steps: [
      {
        prompt: `${application}에 맞는 L4 헤더를 먼저 골라 붙여요.`,
        layers: ['L4'],
        segmentIndex: 0,
        tray: protocolCards,
      },
      {
        prompt: '이어서 L3 헤더와 L2 헤더를 붙여요.',
        layers: ['L3', 'L2'],
        segmentIndex: 0,
        tray: [
          makeEthernetCard('eth-1', 'AA:AA:AA:00:00:0A', 'CC:CC:CC:00:00:0C'),
          makeIpCard('ip-ab', '192.168.0.10', '192.168.0.20'),
        ],
      },
    ],
  };
}

const videoCallDelivery = makeTransportDelivery(
  '영상 통화',
  '영상 조각',
  { protocol: 'UDP', destinationPort: 5004 },
  '영상 통화는 조금 빠져도 이어지는 편이 낫고, TCP의 재전송을 기다리면 화면이 끊겨요.',
  [tcp5004, udp5004],
);

const fileTransferDelivery = makeTransportDelivery(
  '파일 전송',
  '파일 조각',
  { protocol: 'TCP', destinationPort: 443 },
  '파일은 한 조각만 빠져도 열리지 않아서, 도착 확인과 재전송이 있는 TCP가 필요해요.',
  [udp443, tcp443],
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
    { name: '라우터 R1', ports: [R1_LEFT, { label: '오른쪽', ip: '172.16.0.1', mac: '11:11:11:00:00:02' }] },
    {
      name: '라우터 R2',
      ports: [
        { label: '왼쪽', ip: '172.16.0.2', mac: '22:22:22:00:00:01' },
        { label: '오른쪽', ip: '10.0.0.1', mac: '22:22:22:00:00:02' },
      ],
    },
    { name: '웹 서버', ports: [{ ip: '10.0.0.20', mac: 'BB:BB:BB:00:00:0B' }] },
  ],
  segments: [
    { label: '구간 1', sourceMac: 'AA:AA:AA:00:00:0A', destinationMac: '11:11:11:00:00:01' },
    { label: '구간 2', sourceMac: '11:11:11:00:00:02', destinationMac: '22:22:22:00:00:01' },
    { label: '구간 3', sourceMac: '22:22:22:00:00:02', destinationMac: 'BB:BB:BB:00:00:0B' },
  ],
  steps: [
    {
      prompt: 'L4 헤더와 L3 헤더를 붙여요. 목적지는 웹 서버예요.',
      layers: ['L4', 'L3'],
      segmentIndex: 0,
      tray: [
        tcp443,
        makeIpCard('ip-to-router', '192.168.0.10', '172.16.0.2'),
        makeIpCard('ip-ab', '192.168.0.10', '10.0.0.20'),
      ],
    },
    {
      prompt: '구간 1(PC A에서 라우터 R1까지)의 L2 헤더를 붙여요.',
      layers: ['L2'],
      segmentIndex: 0,
      tray: [
        makeEthernetCard('eth-final', 'AA:AA:AA:00:00:0A', 'BB:BB:BB:00:00:0B'),
        makeEthernetCard('eth-1', 'AA:AA:AA:00:00:0A', '11:11:11:00:00:01'),
        makeEthernetCard('eth-swapped', '11:11:11:00:00:01', 'AA:AA:AA:00:00:0A'),
      ],
    },
    {
      prompt: '구간 2(라우터 R1에서 라우터 R2까지)의 L2 헤더를 새로 붙여요.',
      layers: ['L2'],
      segmentIndex: 1,
      tray: [
        makeEthernetCard('eth-2', '11:11:11:00:00:02', '22:22:22:00:00:01'),
        makeEthernetCard('eth-1-again', 'AA:AA:AA:00:00:0A', '11:11:11:00:00:01'),
        makeEthernetCard('eth-final', '11:11:11:00:00:02', 'BB:BB:BB:00:00:0B'),
      ],
    },
    {
      prompt: '구간 3(라우터 R2에서 웹 서버까지)의 L2 헤더를 새로 붙여요.',
      layers: ['L2'],
      segmentIndex: 2,
      tray: [
        makeEthernetCard('eth-2-again', '11:11:11:00:00:02', '22:22:22:00:00:01'),
        makeEthernetCard('eth-wrong-port', '22:22:22:00:00:01', 'BB:BB:BB:00:00:0B'),
        makeEthernetCard('eth-3', '22:22:22:00:00:02', 'BB:BB:BB:00:00:0B'),
      ],
    },
  ],
};

// ---------- 스테이지 5: 역캡슐화 ----------
// 도착한 상자의 라벨이다. 바깥(L2)부터 벗겨야 한다.
const arrivedPacket = {
  payload: '파일 조각',
  destinationName: '서버 B',
  labels: [
    { id: 'arrived-l4', layer: 'L4', values: { protocol: 'TCP', destinationPort: 443 } },
    { id: 'arrived-l3', layer: 'L3', values: { sourceIp: '192.168.0.10', destinationIp: '10.0.0.20' } },
    { id: 'arrived-l2', layer: 'L2', values: { sourceMac: '11:11:11:00:00:02', destinationMac: 'BB:BB:BB:00:00:0B' } },
  ],
};

export const packetStages = [
  {
    number: 1,
    title: '같은 네트워크 안의 PC에게 보내기',
    goal: 'PC A의 메시지를 같은 네트워크의 PC B에게 보내요. 헤더 3장을 L4, L3, L2 순서로 붙여요.',
    hints: [
      '헤더는 안쪽부터 붙여요. 데이터에 가장 먼저 붙는 것은 L4 헤더예요.',
      'L4, L3, L2 순서로 붙이면 L2가 가장 바깥에 와요. L2의 출발지는 PC A, 목적지는 PC B의 MAC이에요.',
    ],
    mode: 'encapsulate',
    deliveries: [sameNetworkDelivery],
    successSummary: '배송 완료. 헤더를 L4, L3, L2 순서로 붙였어요.',
  },
  {
    number: 2,
    title: '라우터 1대를 거쳐 보내기',
    goal: 'PC A의 파일 조각을 서버 B까지 보내요. 라우터를 지날 때마다 L2 헤더를 새로 붙여야 해요.',
    hints: [
      'IP 헤더의 목적지는 라우터가 아니라 최종 목적지(서버 B)예요.',
      '라우터를 지나면 L2 헤더가 떼어져요. 구간 2의 출발지 MAC은 라우터 R1의 오른쪽 MAC이에요.',
    ],
    mode: 'encapsulate',
    deliveries: [oneRouterDelivery],
    successSummary: '배송 완료. 라우터에서 L2 헤더를 새로 붙였고, IP 주소는 끝까지 그대로였어요.',
  },
  {
    number: 3,
    title: 'TCP와 UDP 중 맞는 것을 골라 보내기',
    goal: '영상 통화와 파일 전송을 차례로 보내요. 각각에 맞는 L4 헤더를 골라요.',
    hints: [
      'TCP는 도착을 확인하고 빠진 조각을 다시 보내요. UDP는 확인 없이 바로 보내요.',
      '조금 빠져도 끊기지 않는 것이 중요하면 UDP, 하나도 빠지면 안 되면 TCP예요.',
    ],
    mode: 'encapsulate',
    deliveries: [videoCallDelivery, fileTransferDelivery],
    successSummary: '배송 완료. 영상 통화는 UDP, 파일 전송은 TCP로 보냈어요.',
  },
  {
    number: 4,
    title: '라우터 2대를 거쳐 웹 서버까지 보내기',
    goal: 'PC A의 웹 요청을 라우터 2대를 거쳐 웹 서버까지 보내요. 구간이 3개라서 L2 헤더를 3번 붙여요.',
    hints: [
      '구간마다 출발지 MAC은 보내는 장비, 목적지 MAC은 바로 다음 장비예요.',
      'IP 헤더와 L4 헤더는 한 번만 붙이고, 라우터를 지날 때마다 L2 헤더만 새로 붙여요.',
    ],
    mode: 'encapsulate',
    deliveries: [twoRouterDelivery],
    successSummary: '배송 완료. 라우터를 두 번 지나며 L2 헤더를 새로 붙였고, IP 헤더는 끝까지 그대로였어요.',
  },
  {
    number: 5,
    title: '도착한 패킷에서 원래 데이터 꺼내기',
    goal: '서버 B에 도착한 상자에서 헤더를 벗겨 원래 데이터를 꺼내요.',
    hints: [
      '받는 쪽에서는 보내는 쪽과 반대로, 가장 바깥에 붙은 헤더부터 벗겨요.',
      '가장 바깥은 L2예요. L2, L3, L4 순서로 벗기면 데이터가 나와요.',
    ],
    mode: 'decapsulate',
    arrived: arrivedPacket,
    successSummary: '데이터를 꺼냈어요. L2, L3, L4 순서로 바깥부터 벗겼어요.',
  },
];
