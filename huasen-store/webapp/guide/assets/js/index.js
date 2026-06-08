const navMenuItems = document.querySelectorAll('#nav-menu a');
 
// 设置指示器的点击切换
function handleMenuItemClick(target){
    navMenuItems.forEach(item=>{
        item.classList.remove('active');
        item.style='';
    });
    target.classList.add('active');
 
    //设置要展示的内容
    const cueerntSection = document.querySelector('.active-section');
    cueerntSection.classList.remove('active-section');
    const newCurrentSection = document.querySelector(`.${target.getAttribute('data-rel')}`);
    newCurrentSection.classList.add('active-section');
}
 
navMenuItems.forEach(item=>{
    item.addEventListener('click',e=>handleMenuItemClick(e.target));
    item.classList.contains('active') && handleMenuItemClick(item);
});

const contactEntry = document.querySelector('#contact-entry');
const contactModal = document.querySelector('#contact-modal');
const contactClose = document.querySelector('#contact-close');
const qqQrImg = document.querySelector('#qq-qr-img');
const wechatQrImg = document.querySelector('#wechat-qr-img');
const contactTabs = document.querySelectorAll('.contact-tab');
const contactPanels = document.querySelectorAll('.contact-panel');

function switchContactTab(tabName){
    contactTabs.forEach(tab=>{
        const active = tab.getAttribute('data-contact-tab') === tabName;
        tab.classList.toggle('active',active);
        tab.setAttribute('aria-selected',active ? 'true' : 'false');
    });
    contactPanels.forEach(panel=>{
        panel.classList.toggle('active',panel.getAttribute('data-contact-panel') === tabName);
    });
}

function openQqContactModal(){
    switchContactTab('qq');
    contactModal.classList.add('active');
    contactModal.setAttribute('aria-hidden','false');
}

function closeQqContactModal(){
    contactModal.classList.remove('active');
    contactModal.setAttribute('aria-hidden','true');
}

function hideBrokenQr(img){
    img && img.classList.add('hidden');
}

contactEntry && contactEntry.addEventListener('click',openQqContactModal);
contactClose && contactClose.addEventListener('click',closeQqContactModal);
contactTabs.forEach(tab=>{
    tab.addEventListener('click',()=>switchContactTab(tab.getAttribute('data-contact-tab')));
});
contactModal && contactModal.addEventListener('click',e=>{
    e.target === contactModal && closeQqContactModal();
});
[qqQrImg,wechatQrImg].forEach(img=>{
    img && img.addEventListener('error',()=>hideBrokenQr(img));
    img && img.complete && !img.naturalWidth && hideBrokenQr(img);
});
document.addEventListener('keydown',e=>{
    e.key === 'Escape' && contactModal && contactModal.classList.contains('active') && closeQqContactModal();
});
