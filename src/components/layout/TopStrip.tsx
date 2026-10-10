import styles from "./layout.module.css";

export function TopStrip() {
  return (
    <div className={styles.topStrip} data-site-top-strip="true">
      <a href="https://lilaiireland.com/events/daydream-adventure-2027">
        2027愛爾蘭打工度假分享會免費報名中!
      </a>
    </div>
  );
}
