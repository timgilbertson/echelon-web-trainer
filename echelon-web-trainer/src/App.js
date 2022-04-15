import React from "react";
import logo from "./ftpLogo.gif";
import button from "./btn_strava_connectwith_orange@2x.png";
import "./App.css";

const { REACT_APP_CLIENT_ID } = process.env;
const redirectUrl = "http://localhost:3000/redirect";

function App() {
  const [data, setData] = React.useState(null);

  const handleLogin = () => {
    window.location = `http://www.strava.com/oauth/authorize?client_id=${REACT_APP_CLIENT_ID}&response_type=code&redirect_uri=${redirectUrl}/exchange_token&approval_prompt=force&scope=activity:read,activity:write`;
  };

  // React.useEffect(() => {
  //   fetch("/api")
  //     .then((res) => res.json())
  //     .then((data) => setData(data.message));
  // }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <img src={button} className="App-button" alt="Connect to Strava" onClick={handleLogin}/>
        <p>{!data ? "Loading..." : data}</p>
      </header>
    </div>
  );
}

export default App;