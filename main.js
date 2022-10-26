// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const path = require('path')
const windowStateKeeper  = require('electron-window-state')
const appMenu = require('./menu')
const {spawn} = require('child_process')
const http = require('http')



const MODEL_URL = `${__dirname}/model/mutiLabel_efficientnet5.h5`
const PORT = 6723



async function getImageLabel(e, imgPath) {
  let req = http.get(`http://127.0.0.1:${PORT}/classify?path=${imgPath}`, res=>{
    console.log(res.statusCode)
    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', ()=>{
      console.log(rawData)
      return e.reply('classified', rawData)
    })
  })

  // console.log(req)
  req.on('error', err=>{
    console.log(`Printing error: ${err}`)
    setTimeout(()=>{
      getImageLabel(e, imgPath)
    }, 3000)
  })
}

ipcMain.on('get-img-path', e=>{
  dialog.showOpenDialog({
    title: 'Select Image',
    filters: [
      { name: 'Images', extensions: ['jpeg', 'jpg', 'png'] },
    ],
    properties: ['openFile'],
    buttonLabel: 'Select'
  }).then(results=>{
    // console.log('results from main ' + results.filePaths)
    if(!results.canceled) e.reply('img-path', results.filePaths)
  })
})


ipcMain.on('classify_image', (e,imgPath)=>{
  getImageLabel(e, imgPath)
  
})

 function startServer () {
  try{
  const ls = spawn(path.join(__dirname, 'model', 'server'), [MODEL_URL])
  ls.stdout.on('error', err=>{
    console.log(err)
  })
}
catch(error) {
  console.error(error)
}
}

 function shutdownServer() {

  const req = http.get(`http://127.0.0.1:${PORT}/shutdown`, res=>{
    console.log(`statusCode: ${res.statusCode}`)
  })
  
  req.on('error', error => {
    console.error(error)
  })

}

let mainWindow
let loadingWin


function createLoadingWin() {
    loadingWin = new BrowserWindow({
    width: 500,
    height: 250,
    frame: false
  })

  loadingWin.loadFile('./renderer/loading.html')

  loadingWin.setResizable(false)
  loadingWin.on('close', e=>{
      loadingWin = null
  })

  loadingWin.webContents.on('did-finish-load', e=>{
      loadingWin.show()
  })

}


function createWindow () {

  // Load the previous state with fallback to defaults
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1050,
    defaultHeight: 730
  });


  // Create the browser window.
    mainWindow = new BrowserWindow({
    width: mainWindowState.width,
    height: mainWindowState.height,
    x: mainWindowState.x,
    y: mainWindowState.y,
    minWidth: 1050,
    minHeight: 750,
    show: false,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js')
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  })

  // creating menu
  appMenu(mainWindow.webContents)

  // and load the index.html of the app.
  mainWindow.loadFile('renderer/main.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  mainWindowState.manage(mainWindow)

  mainWindow.on('ready-to-show', ()=>{
    if(loadingWin) loadingWin.close()

    mainWindow.show()
  })


  mainWindow.on('close', ()=>{
    console.log('on close main window')
    shutdownServer()
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createLoadingWin()
  startServer()

  setTimeout(() => {
    createWindow();
  }, 10000);

})
  // createWindow()
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
