import { BrowserRouter } from 'react-router-dom';
import { SiteWrapper } from './components/SiteWrapper';
import { Router } from './Router';

function App() {
  return (
    <BrowserRouter>
      <SiteWrapper>
        <Router />
      </SiteWrapper>
    </BrowserRouter>
  );
}

export default App;
