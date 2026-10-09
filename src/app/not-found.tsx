import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="ds-container ds-container--narrow">
        <h1>找不到這個頁面</h1>
        <p>這個網址目前沒有對應內容。若這是既有文章或頁面，請把它加入 URL map 並確認 WordPress slug。</p>
        <Link className="btn btn-primary" href="/">
          回首頁
        </Link>
      </div>
    </main>
  );
}
