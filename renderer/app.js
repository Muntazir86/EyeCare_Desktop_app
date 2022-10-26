const { ipcRenderer} = require("electron")
const BrowserWindow = require('electron').remote.BrowserWindow

const browseBtn = document.getElementById('browseBtn'),
      classifyBtn = document.getElementById('classifyBtn'),
      image = document.getElementById('image'),
      label = document.getElementById('image_class')

let imgPath      
let labels = ['No DR', 'Mild', 'Moderate', 'Severe', 'Proliferative']

// browse image from menu
ipcRenderer.on('select-image-menu', e=>{
    browseBtn.click()
})

// classify image from menu
ipcRenderer.on('classify-menu', e=>{
    classifyBtn.click()
})

ipcRenderer.on('show-about-menu', e=>{

    let win = new BrowserWindow({
        width: 600,
        height: 530,
        alwaysOnTop: true,
        show: false,
        autoHideMenuBar: true
        // frame: false
    })
    win.setResizable(false)
    win.on('close', ()=>{win = null})
    win.on('blur', ()=> win.close())
    win.loadFile('./renderer/about.html')
    win.on('ready-to-show', ()=>{win.show()})
})

// open dialog to select image
browseBtn.addEventListener('click', ()=>{

    ipcRenderer.send('get-img-path')
})

// browse image by clicking image
image.addEventListener('click', ()=>{
    browseBtn.click()
})


ipcRenderer.on('img-path', (e, results)=>{
    imgPath = results[0]
    image.src = imgPath
    label.innerText = ''
    classifyBtn.disabled = false
})

classifyBtn.addEventListener('click', async ()=>{
    if(imgPath != null){
        ipcRenderer.send('classify_image', imgPath)
        classifyBtn.innerText = 'classifying...'
        classifyBtn.disabled = true
        browseBtn.disabled = true       
    }
})

ipcRenderer.on('classified', (e, result)=>{
    
    label.innerText = labels[parseInt(result)]
    classifyBtn.innerText = 'classify'
    browseBtn.disabled = false
    if(result <= 2){
        label.style.color = 'green'
    }
    else{
        label.style.color = 'red'
    }
})

