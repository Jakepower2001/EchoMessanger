import React from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import LoggedInHome from "./components/LoggedInHome";

const App: React.FC = () => {
  const isLoggedIn = !!localStorage.getItem("user"); // Or use your auth logic

  return (
    <Router>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/home" render={() => (
          isLoggedIn ? <LoggedInHome /> : <Redirect to="/login" />
        )} />
        <Redirect from="/" to="/home" />
      </Switch>
    </Router>
  );
};

export default App;