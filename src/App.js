import React, { PureComponent } from 'react'
import Dropzone from 'react-dropzone'
import idGenerator from 'incremental-id-generator'

const nextID = idGenerator('abcdefghijklmnopqrstuvwxyz')

class App extends PureComponent {
  state = {
    accepted: [],
    rejected: [],
    colors: new Map(),
    pixelMap: '',
  }

  handleDrop = async (accepted, rejected) => {
      const colors = new Map();
      let pixelMap = `$pixel-art: (`;
      for (let imgSrc of accepted) {
        pixelMap = `${pixelMap}
  ${imgSrc.name.split('.')[0]}: (`;
        const calculate = () => new Promise(resolve => {
          const img = new Image();
          img.src = imgSrc.preview;
          img.addEventListener('load', () => {
            const { width, height } = img;
            console.log(width, height, imgSrc.name);
            this.c.width = width;
            this.c.height = height;
            const ctx = this.c.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            let map = '';
            
            for (let y = 0; y < width; y++) {
              let row = `(`;
              for (let x = 0; x < height; x++) {
                const { data: [r, g, b, a] } = ctx.getImageData(x, y, 1, 1);
                const color = `rgba(${r}, ${g}, ${b}, ${a})`;
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
  ),`
            ctx.clearRect(0, 0, width, height);
            resolve();
          }, false);
        });
        await calculate();
      }
    pixelMap = `${pixelMap}
);`
    this.setState(prevState => ({ ...prevState, accepted, rejected, colors, pixelMap }));
  };

  initialiazeRef = (c) => {
    if (c) this.c = c;
  }
  
  createColorString = () => {
    let str = `$colors: (`;
    for (let [color, code] of this.state.colors) {
      str = `${str}
  '${code}': '${color}',`;
    }
    return `${str}
);`
  }

  render() {
    
    const colors = this.createColorString()
    
    return (
      <div>
        <canvas ref={this.initialiazeRef} id="canvas" style={{ display: 'none' }} />
        <Dropzone
            accept="image/jpeg, image/png"
            onDrop={this.handleDrop}
          >
            <p>Try dropping some files here, or click to select files to upload.</p>
            <p>Only *.jpeg and *.png images will be accepted</p>
          </Dropzone>
        <main>
          <div>
          <pre>
            {colors}
          </pre>
          </div>
          <div>
          <pre>
            {this.state.pixelMap}
          </pre>
          </div>
        </main>
        <aside>
          <h2>Accepted files</h2>
          <ul>
            {
              this.state.accepted.map(f => <li key={f.name}>{f.name} - <img src={f.preview} /></li>)
            }
          </ul>
        </aside>
      </div>
    )
  }
}

export default App