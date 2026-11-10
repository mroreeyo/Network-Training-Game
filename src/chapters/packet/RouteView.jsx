import styles from './RouteView.module.css';

// 경로 표: 장비마다 IP·MAC을 보여 주고, 상자가 있는 장비를 글자로 알린다.
function Stop({ stop, here }) {
  return (
    <li className={`${styles.stop} ${here ? styles.here : ''}`}>
      <span className="text-label">{stop.name}</span>
      {here ? <span className={styles.badge}>상자가 여기 있어요</span> : null}
      <div className={styles.ports}>
        {stop.ports.map((port) => (
          <dl key={port.mac} className={styles.addresses}>
            <dt>{port.label ? `${port.label} IP` : 'IP'}</dt>
            <dd>{port.ip}</dd>
            <dt>{port.label ? `${port.label} MAC` : 'MAC'}</dt>
            <dd>{port.mac}</dd>
          </dl>
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
          {segment.label}
          {passed ? ' (지나옴)' : ''}
        </li>,
      );
    }
  });
  return <ol className={`${styles.route} numeric`}>{items}</ol>;
}

export default RouteView;
