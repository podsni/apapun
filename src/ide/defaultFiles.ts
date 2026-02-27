import type { FileTab } from './types.ts';

export const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="app">
    <h1>Hello World! 🚀</h1>
    <p>Edit the files to see live changes.</p>
    <button onclick="handleClick()">Click me!</button>
    <div id="output"></div>
  </div>
  <script src="script.js"></script>
</body>
</html>`;

export const DEFAULT_CSS = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

#app {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
}

p {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
}

#output {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: #f8f9fa;
  color: #333;
  font-size: 0.95rem;
  min-height: 40px;
}`;

export const DEFAULT_JS = `let clickCount = 0;

function handleClick() {
  clickCount++;
  const output = document.getElementById('output');
  output.textContent = \`Button clicked \${clickCount} time\${clickCount === 1 ? '' : 's'}! 🎉\`;
  output.style.background = \`hsl(\${clickCount * 40}, 70%, 90%)\`;
}

console.log('Script loaded! 🚀');`;

export const DEFAULT_JSX = `// React JSX Example
// This will be compiled by Babel in the preview

function Counter() {
  const [count, setCount] = React.useState(0);

  return (
    <div style={{
      fontFamily: 'system-ui',
      maxWidth: '400px',
      margin: '2rem auto',
      padding: '2rem',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#764ba2' }}>
        React Counter ⚛️
      </h1>
      <p style={{ fontSize: '4rem', fontWeight: 'bold', color: '#667eea', margin: '1rem 0' }}>
        {count}
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button
          onClick={() => setCount(c => c - 1)}
          style={{
            padding: '0.5rem 1.5rem',
            fontSize: '1.5rem',
            background: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          -
        </button>
        <button
          onClick={() => setCount(c => c + 1)}
          style={{
            padding: '0.5rem 1.5rem',
            fontSize: '1.5rem',
            background: '#51cf66',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          +
        </button>
      </div>
      <button
        onClick={() => setCount(0)}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          background: '#868e96',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.9rem'
        }}
      >
        Reset
      </button>
    </div>
  );
}

// Render to DOM
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Counter />);`;

export const DEFAULT_FILES: FileTab[] = [
  {
    id: 'index-html',
    name: 'index.html',
    content: DEFAULT_HTML,
    language: 'html',
    isModified: false,
  },
  {
    id: 'style-css',
    name: 'style.css',
    content: DEFAULT_CSS,
    language: 'css',
    isModified: false,
  },
  {
    id: 'script-js',
    name: 'script.js',
    content: DEFAULT_JS,
    language: 'javascript',
    isModified: false,
  },
  {
    id: 'app-jsx',
    name: 'App.jsx',
    content: DEFAULT_JSX,
    language: 'jsx',
    isModified: false,
  },
];
