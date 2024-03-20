

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



// Add an event listener to the form to prevent click propagation
document.getElementById('filterForm').addEventListener('click', function(event) {
  event.stopPropagation(); // Stop the click event from propagating to the parent elements
});


document.getElementById('printform').addEventListener('click', function(event) {
  event.stopPropagation(); // Stop the click event from propagating to the parent elements
});

// Function to toggle the side popup
function display_toggle_side_Popup(id) {
  // Get the element with the specified ID
  const clickedSubMenu = document.getElementById(id);

  // Get all existing sub-menus
  const subMenus = document.querySelectorAll('.sidebar_items .side_menu_popup.show');

  // Close all open sub-menus except the clicked one
  subMenus.forEach(subMenu => {
    if (subMenu !== clickedSubMenu) {
      subMenu.classList.remove('show'); // Close others
    }
  });

  // Toggle the clicked baselayer-menu's visibility
  clickedSubMenu.classList.toggle('show'); // Toggle display
}




// Function to toggle the display of the ul

document.addEventListener("DOMContentLoaded", function () {
  const baseLayerContainer = document.getElementById("base_layer_container");
  const baseLayerList = document.getElementById("base_layer_menu");
  const baseLayerIcon = document.getElementById("base_layer_container_icon");

  // Toggle the display of the base layer list when the icon is clicked
  baseLayerIcon.addEventListener("click", function () {
      baseLayerList.classList.toggle("show");
  });

  // Hide the base layer list when clicking outside of it
  document.addEventListener("click", function (event) {
      if (!baseLayerContainer.contains(event.target)) {
          baseLayerList.classList.remove("show");
      }
  });
});



// --------------------------------------------------------
// Layer select

async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('There was a problem with your fetch operation:', error);
  }
}

// Function to populate the state dropdown
async function populateStates() {
  const jsonData = await fetchJSON('./states-and-districts.json');
  const stateSelect = document.getElementById("state");
  jsonData.states.forEach(stateData => {
    const option = document.createElement("option");
    option.text = stateData.state;
    option.value = stateData.state;
    stateSelect.add(option);
  });
}

// Function to populate the district dropdown based on the selected state
async function populateDistricts() {
  const jsonData = await fetchJSON('./states-and-districts.json');
  const stateSelect = document.getElementById("state");
  const districtSelect = document.getElementById("district");
  const selectedState = stateSelect.value;
  districtSelect.innerHTML = "<option value=''>Select District</option>"; // Clear previous options

  if (selectedState) {
    const selectedStateData = jsonData.states.find(state => state.state === selectedState);
    if (selectedStateData) {
      selectedStateData.districts.forEach(district => {
        const option = document.createElement("option");
        option.text = district;
        option.value = district;
        districtSelect.add(option);
      });
    }
  }
}

// Attach event listeners
document.getElementById("state").addEventListener("change", populateDistricts);

// Populate states when the page loads
populateStates();



const checkbox = document.getElementById("stateboundary");
checkbox.addEventListener('change', function(event) {
  // console.log(checkbox.addEventListener);
  console.log("Checkbox evnt listner");
});


// Function to activate menu option
function activateOption(element) {
  var menuItems = document.querySelectorAll('#base_layer_menu li');
  
  // Remove 'active' class from all menu items
  menuItems.forEach(function(item) {
      item.classList.remove('active');
  });

  // Add 'active' class to the clicked menu item
  element.classList.add('active');
}

function clearLocation() {
  // Get the input element
  var input = document.getElementById("locationInput");

  // Clear the input field
  input.value = "";
}


// Function to activate menu option
function activateOption(element) {
  var menuItems = document.querySelectorAll('#base_layer_menu li');
 
  // Remove 'active' class from all menu items
  menuItems.forEach(function(item) {
      item.classList.remove('active');
  });

  // Add 'active' class to the clicked menu item
  element.classList.add('active');
}

 
