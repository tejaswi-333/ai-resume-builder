import './App.css'
import HomePage from './pages/Home'

function App() {
  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">

          <a href="/" className="brand">
            <span className="brand-mark">✦</span>
            <span>AI Resume Builder</span>
          </a>

          <div className="nav-links">
            <a href="#details">Build Resume</a>
            <a href="#output">How It Works</a>
          </div>

          <a href="#details" className="nav-button">
            Get Started
            <span>→</span>
          </a>

        </div>
      </nav>

      <HomePage />
    </>
  )
}

export default App