import React, { PureComponent } from 'react';
import Dropzone from 'react-dropzone';
import idGenerator from 'incremental-id-generator';
import CopyToClipboard from 'react-copy-to-clipboard';

class App extends PureComponent {
  state = {
    accepted: [],
    rejected: [],
    colors: new Map(),
    pixelMap: ''
  };

  handleDrop = async (accepted, rejected) => {
    const nextID = idGenerator('abcdefghijklmnopqrstuvwxyz');
    const colors = new Map();
    let pixelMap = `$pixel-art: (`;
    for (let imgSrc of accepted) {
      pixelMap = `${pixelMap}
  ${imgSrc.name.split('.')[0]}: (`;
      const calculate = () =>
        new Promise(resolve => {
          const img = new Image();
          img.src = imgSrc.preview;
          img.addEventListener(
            'load',
            () => {
              const { width, height } = img;
              console.log(width, height, imgSrc.name);
              this.c.width = width;
              this.c.height = height;
              const ctx = this.c.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);
              let map = '';

              for (let y = 0; y < height; y++) {
                let row = `(`;
                for (let x = 0; x < width; x++) {
                  const { data: [r, g, b, a] } = ctx.getImageData(x, y, 1, 1);
                  const color = `rgba(${r}, ${g}, ${b}, ${(a / 255)})`;
                  if (!colors.has(color)) {
                    colors.set(color, nextID());
                  }
                  const char = colors.get(color);
                  row = `${row} ${char}`;
                }
                row = `${row})`;
                map = `${map}
    ${row}`;
              }
              pixelMap = `${pixelMap}
${map}
  ),`;
              ctx.clearRect(0, 0, width, height);
              resolve();
            },
            false
          );
        });
      await calculate();
    }
    let colorsMap = `$colors: (`;
    for (let [color, code] of colors) {
      colorsMap = `${colorsMap}
  '${code}': '${color}',`;
    }
    colorsMap = `${colorsMap}
);`;
    pixelMap = `
${colorsMap}

${pixelMap}
);`;
    this.setState(prevState => ({
      ...prevState,
      accepted,
      rejected,
      colors,
      pixelMap
    }));
  };

  initialiazeRef = c => {
    if (c) this.c = c;
  };

  render() {
    return (
      <div>
        <canvas
          ref={this.initialiazeRef}
          id="canvas"
          style={{ display: 'none' }}
        />
        <Dropzone accept="image/jpeg, image/png" onDrop={this.handleDrop}>
          <p>
            Try dropping some files here, or click to select files to upload.
          </p>
          <p>Only *.jpeg and *.png images will be accepted</p>
        </Dropzone>
        <main id="main">
        <CopyToClipboard text={this.state.pixelMap}>
          <button>Copy to clipboard</button>
        </CopyToClipboard>
          <div>
            <pre>
              {this.state.pixelMap}
            </pre>
          </div>
        </main>
        <aside>
          <h2>Accepted files</h2>
          <ul>
            {this.state.accepted.map(f => (
              <li key={f.name}>{f.name} - <img src={f.preview} /></li>
            ))}
          </ul>
        </aside>
      </div>
    );
  }
}

export default App;
