import { cssRaw, forceRenderStyles, style } from "typestyle";

import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { observer } from 'mobx-react';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
import * as injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();
cssRaw(`
@import url('https://fonts.googleapis.com/css?family=Roboto');
`);
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

let Component: any;

const App = () => (
  <MuiThemeProvider>
    <Component />
  </MuiThemeProvider>
);

/** Make it less magic to demo stuff by styling the browser built in stuff */
cssRaw(`
p {
  font-family: Roboto, arial;
  color: #333;
}
`);

export function render(component: () => React.ReactNode) {
  Component = observer(component as any);
  ReactDOM.render(
    <App />,
    document.getElementById('root')
  );
  forceRenderStyles();
}


import FlatButton from 'material-ui/FlatButton';

export const Button: React.StatelessComponent<{ onClick: () => void }> = ({ children, onClick }) => {
  return <FlatButton
    onClick={onClick}
    primary={true}>
    {children}
  </FlatButton>
}
