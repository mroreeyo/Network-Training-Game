// 챕터 1 개념 카드. 학습자가 그대로 외우는 문장이라서 네트워크 사실과 맞는지 확인한 내용만 적는다.
export const packetConceptCards = [
  {
    id: 'packet-1',
    chapterId: 'packet',
    stageNumber: 1,
    title: '캡슐화',
    lines: [
      '데이터에 L4, L3, L2 순서로 헤더를 붙이는 것을 캡슐화라고 해요.',
      'L4 헤더는 포트 번호로 받을 프로그램을, L3 헤더는 IP 주소로 최종 목적지를, L2 헤더는 MAC 주소로 같은 구간의 다음 장비를 알려 줘요.',
      '나중에 붙인 헤더일수록 바깥에 있어요.',
    ],
  },
  {
    id: 'packet-2',
    chapterId: 'packet',
    stageNumber: 2,
    title: 'MAC은 구간마다 바뀐다',
    lines: [
      'IP 주소는 출발지에서 최종 목적지까지 그대로예요.',
      'MAC 주소는 같은 네트워크 안에서만 통해서, 구간마다 출발지와 목적지가 바뀌어요.',
      '라우터는 L2 헤더를 떼고, 다음 구간용 L2 헤더를 새로 붙여 내보내요.',
    ],
  },
  {
    id: 'packet-3',
    chapterId: 'packet',
    stageNumber: 3,
    title: 'TCP와 UDP',
    lines: [
      'TCP는 도착을 확인하고 빠진 조각을 다시 보내서, 파일 전송처럼 하나도 빠지면 안 될 때 써요.',
      'UDP는 확인 없이 바로 보내서 빠르지만 조각이 빠질 수 있어서, 영상 통화처럼 지연이 적은 것이 중요할 때 써요.',
      'L4 헤더에는 받을 프로그램을 알려 주는 포트 번호가 들어 있어요.',
    ],
  },
  {
    id: 'packet-4',
    chapterId: 'packet',
    stageNumber: 4,
    title: '라우터를 여러 번 지날 때',
    lines: [
      '라우터를 지나도 IP 헤더의 출발지·목적지 IP와 L4 헤더의 포트는 그대로예요.',
      '라우터는 목적지 IP를 보고 다음에 보낼 장비를 정한 뒤, 그 장비의 MAC을 목적지로 L2 헤더를 새로 만들어요.',
      '구간이 3개면 L2 헤더도 3번 만들어져요.',
    ],
  },
];
