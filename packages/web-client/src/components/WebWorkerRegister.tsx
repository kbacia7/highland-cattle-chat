export default () => (
  <script
    dangerouslySetInnerHTML={`
      if(window.Worker) {
        const webWorker = new Worker("web-worker.js");
      }`}
  ></script>
);
