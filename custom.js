

const menuToggle = document.querySelector('.menu_sidebar_container-toggle');
const menu = document.querySelector('.menu_sidebar_container');

menuToggle.addEventListener('click', () => {
    menu.classList.toggle('active');
    let navmenuOpen = document.getElementById("menu_open")
    let navmenuClose = document.getElementById("menu_close")
    
    if(window.getComputedStyle(navmenuOpen).display==='block'){
        navmenuOpen.style.display='none'
        navmenuClose.style.display='block'
        console.log(navmenuOpen.style.display)
        console.log(navmenuClose.style.display)

    }else{
        navmenuOpen.style.display='block'
        navmenuClose.style.display='none'
        console.log(navmenuOpen.style.display)
        console.log(navmenuClose.style.display)

    }

});




function fullscreen_click(){
    let fullscrIn= document.getElementById("fullscreen_in");
    let fullscrOut= document.getElementById("fullscreen_out");

    
    console.log(window.getComputedStyle(fullscrIn).display)
    if(window.getComputedStyle(fullscrIn).display==='block'){
        fullscrIn.style.display='none'
        fullscrOut.style.display='block'

    }else{
        fullscrIn.style.display='block'
        fullscrOut.style.display='none'

    }
}


function display_toggle(id) {
    // Get the element with the specified ID
    const clickedSubMenu = document.getElementById(id);
  
    // Get all existing sub-menus
    const subMenus = document.querySelectorAll('.sidebar_items ul.show');
  
    // Close all open sub-menus except the clicked one
    subMenus.forEach(subMenu => {
      if (subMenu !== clickedSubMenu) {
        subMenu.classList.remove('show');  //close others
      }
    });
  
    // Toggle the clicked sub-menu's visibility
    clickedSubMenu.classList.toggle('show');       //display-hide toggle
  }
  
  // Add a click event listener to the entire document
  document.addEventListener('click', function(event) {
    // Check if the click target is not within the sidebar or any sub-menu
    if (!event.target.closest('.sidebar_items, .sidebar_items ul')) {
      // Close all open sub-menus
      const openSubMenus = document.querySelectorAll('.sidebar_items ul.show');
      openSubMenus.forEach(subMenu => {
        subMenu.classList.remove('show');   //clicked out side
      });
    }
  });
  


function display_toggle_block(id) {
  // Get the element with the specified ID
  const clickedSubMenu = document.getElementById(id);

  // Get all existing sub-menus
  const subMenus = document.querySelectorAll('.side_menu_container_optins .side_menu_cat2.show');

  // Close all open sub-menus except the clicked one
  subMenus.forEach(subMenu => {
    if (subMenu !== clickedSubMenu) {
      subMenu.classList.remove('show');  //close others
    }
  });

  // Toggle the clicked sub-menu's visibility
  clickedSubMenu.classList.toggle('show');       //display-hide toggle
}

function display_toggle_block_adminState(id) {
  // Get the element with the specified ID
  const clickedSubMenu = document.getElementById(id);

  // Get all existing sub-menus
  const subMenus = document.querySelectorAll('.side_menu_container_optins .side_menu_cat3.show');

  // Close all open sub-menus except the clicked one
  subMenus.forEach(subMenu => {
    if (subMenu !== clickedSubMenu) {
      subMenu.classList.remove('show');  //close others
    }
  });

  // Toggle the clicked sub-menu's visibility
  clickedSubMenu.classList.toggle('show');       //display-hide toggle
}

