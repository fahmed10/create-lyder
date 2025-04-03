import Lyder from "lyder";

Lyder.createRoot(document.getElementById("app")).render(<App />);

function App() {
    let $count = 0;
    
    return <button onclick={() => $count++}>Count: {$count}</button>;
}