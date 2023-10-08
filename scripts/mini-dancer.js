let gViewport = null;
let gMinis = null;

const drawViewport = (viewport) => {
    let w = viewport.screenDimensions[0];
    let h = viewport.screenDimensions[1];
    let x = viewport.viewPosition.x;
    let y = viewport.viewPosition.y;
    let s = viewport.viewPosition.scale;

    let ul = [
        x-(w/2)/s, y-(h/2)/s
    ];

    let lr = [
        x+(w/2)/s, y+(h/2)/s
    ];

    canvas.app.stage.removeChild(gViewport);
    gViewport = new PIXI.Graphics();
    gViewport.beginFill(0x00DD00, 0.2);
    gViewport.drawRect(ul[0], ul[1], lr[0]-ul[0], lr[1]-ul[1]);
    gViewport.endFill();
    canvas.app.stage.addChild(gViewport);
}

const updateState = (viewport) => {
    drawViewport(viewport);
    fetch("/mini-dancer/coords")
        .then(res => res.json())
        .then(data => {
            drawMinis(data, viewport);
        });
}

const drawMinis = (data, viewport) => {
    let w = viewport.screenDimensions[0];
    let h = viewport.screenDimensions[1];
    let x = viewport.viewPosition.x;
    let y = viewport.viewPosition.y;
    let s = viewport.viewPosition.scale;

    let ul = [
        x-(w/2)/s, y-(h/2)/s
    ];

    let lr = [
        x+(w/2)/s, y+(h/2)/s
    ];

    let dx = lr[0] - ul[0];
    let dy = lr[1] - ul[1];

    canvas.app.stage.removeChild(gMinis);
    gMinis = new PIXI.Graphics();

    data.forEach(mini => {
        // Display is rotated -90 degrees
        let mx = ul[0] + (1-mini['b_c'][1]) * dx
        let my = ul[1] + mini['b_c'][0] * dy
        gMinis.beginFill(0x000000);
        gMinis.drawRect(mx, my-50, 100, 100);
        gMinis.endFill(0x000000);
    });

    canvas.app.stage.addChild(gMinis);
}

let pulseDimensions = () => {};
pulseDimensions = () => {
    game.socket.emit('module.mini-dancer', {
        type: 'DISPLAY_INFO',
        payload: {
            viewPosition: game.canvas.scene._viewPosition,
            screenDimensions: game.canvas.screenDimensions
        }
    });
    setTimeout(pulseDimensions, 400);
};

Hooks.on("canvasReady", () => {
    if(game.user.isGM) {
        // GM workflow
        game.socket.on('module.mini-dancer', (message) => {
            let type = message.type;
            let payload = message.payload;
            switch(type) {
                case 'DISPLAY_INFO':
                    updateState(payload);
                    break;
                default:
                    console.error(`Unknown type received: ${type}`)
            }
        });
    } else if(game.user.name === 'Display') {
        // Display user workflow
        pulseDimensions();
    } else {
        console.log("Mini dancer ignoring current user")
    }
});
