import { Routes, Route } from "react-router-dom";
import { Component } from "react";
import BotPage from "./BotPage.jsx";
import DashboardPage from "./DashboardPage.jsx";

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{padding:40,fontFamily:"monospace",color:"#F2EDE6",background:"#090705",minHeight:"100vh"}}>
          <div style={{color:"#E8714A",marginBottom:12}}>App error — please send this to the team:</div>
          <pre style={{whiteSpace:"pre-wrap",fontSize:13}}>{String(this.state.error)}{"\n\n"}{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<BotPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </ErrorBoundary>
  );
}
