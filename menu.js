const {Menu, MenuItem} = require('electron')

module.exports = appWin=>{

    let template = [
        {
            label: 'Tools',
            submenu: [
                {
                    label: 'Select Image',
                    accelerator: 'CmdOrCtrl+O',
                    click: ()=>{
                        appWin.send('select-image-menu')
                    }
                },
                {
                    label: 'Classify',
                    accelerator: 'CmdOrCtrl+Shift+C',
                    click: ()=>{
                        appWin.send('classify-menu')
                    }
                }
            ]
        },
        {
            role: 'windowMenu'
        },
        {
            role: 'help',
            submenu:[
                {
                    label: 'About Us',
                    click: ()=>{
                        appWin.send('show-about-menu')
                    }
                }
            ]
        }
    ]


    //create Mac menu
    if(process.platform === 'darwin') template.unshift({role: 'appMenu'})

    let menu = Menu.buildFromTemplate(template)

    Menu.setApplicationMenu(menu)
}