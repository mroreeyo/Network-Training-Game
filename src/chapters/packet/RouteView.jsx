import styles from './RouteView.module.css';

// 경로 표: 장비마다 IP·MAC을 보여 주고, 상자가 있는 장비를 글자로 알린다.
function Stop({ stop, here }) {
  return (
    <li className={`${styles.stop} ${here ? styles.here : ''}`}>
      <span className="text-label">{stop.name}</span>
      {here ? <span className={styles.badge}>상자가 여기 있어요</span> : null}
      <div className={styles.ports}>
        {/* 라우터 포트 이름(들어오는 쪽, 나가는 쪽)은 주소 위에 한 번만 적는다.
            줄마다 "들어오는 쪽 MAC"처럼 붙이면 칸이 넓어져서 라우터 2대 경로가 한 줄에 들어가지 않는다. */}
        {stop.ports.map((port) => (
          <div key={port.mac} className={styles.port}>
            {port.label ? <p className={styles.portLabel}>{port.label}</p> : null}
            <dl className={styles.addresses}>
              <dt>IP</dt>
              <dd>{port.ip}</dd>
              <dt>MAC</dt>
              <dd>{port.mac}</dd>
            </dl>
          </div>
        ))}
      </div>
    </li>
  );
}

function RouteView({ delivery, stopIndex }) {
  const items = [];
  delivery.stops.forEach((stop, index) => {
    items.push(<Stop key={stop.name} stop={stop} here={index === stopIndex} />);
    const segment = delivery.segments[index];
    if (segment) {
      const passed = index < stopIndex;
      const linkClass = `${styles.link} ${passed ? styles.passed : ''}`;
      items.push(
        <li key={segment.label} className={linkClass}>
          <span>{segment.label}</span>
          {/* 넓은 화면에서는 "(지나옴)"을 둘째 줄에 둔다. 한 줄로 쓰면 구간 띠가 넓어져서 라우터가 2대인 경로의 끝 장비가 잘린다. */}
          {passed ? <span className={styles.passedNote}> (지나옴)</span> : null}
        </li>,
      );
    }
  });
  return <ol className={`${styles.route} numeric`}>{items}</ol>;
}

export default RouteView;
