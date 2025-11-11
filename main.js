const API_URL = 'https://6912d01d52a60f10c822d657.mockapi.io/api/v1/destinations';

const destinationInput = document.getElementById('destination');
const addButton = document.getElementById('add');
const updateButton = document.getElementById('update');
const cancelButton = document.getElementById('cancel');
const travelList = document.querySelector('.travel-list');
const loadingIndicator = document.querySelector('.loading');
const errorMsg = document.querySelector('.error-msg');
let currentEditId = null;

async function fetchData(){
    try{
        loadingIndicator.style.display = 'block';
        travelList.innerHTML = '';
        const response = await fetch(API_URL);
        const destinations = await response.json();
        loadingIndicator.style.display = 'none';
        console.log(destinations);
        if(destinations.length === 0){
            travelList.innerHTML = `<div class="empty-state">No destinations yet. Add one to get started!</div>`;
        }
        destinations.forEach((element, _i) => {
            const li = createElement(element, _i);
            travelList.appendChild(li); 
        });
    }catch(error){
        showError('Failed to load destinations');
    }
}
addButton.addEventListener('click', async () => {
    const destination = destinationInput.value.trim();
    if (destination === '') {
        showError('Destination cannot be empty');
        return;
    }

    try {
        const response = await fetch(`${API_URL}`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ destination: destination, visited: false })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        destinationInput.value = '';
        fetchData();
    } catch (error) {
        showError('Failed to add destination');
        console.log(error);
    }
});

async function deleteElement(destination, id){
    const confirmDelete = confirm(`Are you sure you want to delete "${destination}" from your travel list?`);
    try{
        if(!confirmDelete) return;
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });
        if(!response.ok){
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        fetchData();
    }catch(error){
        showError('Failed to delete destination');
        console.log(error);
    }
}
function editElement(destination, id){
    addButton.style.display = 'none';
    updateButton.style.display = 'inline-block';
    cancelButton.style.display = 'inline-block';
    destinationInput.value = destination;
    currentEditId = id;
}
async function updateElement(){
    try{
        const updatedDestination = destinationInput.value.trim();
        if(updatedDestination === ''){
            showError('Destination cannot be empty');
            return;
        }
        const response = await fetch(`${API_URL}/${currentEditId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({destination: updatedDestination})
        });
        if(!response.ok){
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        destinationInput.value = '';
        addButton.style.display = 'inline-block';
        updateButton.style.display = 'none';
        cancelButton.style.display = 'none';
        currentEditId = null;
        fetchData();
    }catch(error){
        showError('Failed to update destination');
    }
}
function cancelEdit(){
    destinationInput.value = '';
    addButton.style.display = 'inline-block';
    updateButton.style.display = 'none';
    cancelButton.style.display = 'none';
    currentEditId = null;
}
function showError(message){
    errorMsg.innerHTML = message;
    errorMsg.style.display = 'block';
    loadingIndicator.style.display = 'none';

}
function toggleComplete(isVisited, id){
    fetch(`${API_URL}/${id}`,{
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json', 
        },
        body: JSON.stringify({visited: !isVisited})
    }).then(fetchData)
    .catch((error) => {
        showError('Failed to update destination');
        console.log(error);
    });
}
function createElement(element, index){
    const li = document.createElement('li');
    const imgSrc = element.visited ? 'img/checked.png' : 'img/unchecked.png';

    const controls = `
                <div class="controls">
                    <button class="visited" onclick="toggleComplete(${element.visited}, ${element.id})"><img src="${imgSrc}" alt="ischecked"></button>
                    <button class="edit"><img src="img/edit.png" alt="edit"></button>
                    <button class="delete"><img src="img/delete.png" alt="delete">
                    </button>
                </div>`;
    li.innerHTML = `
         <span class="destination-name">${index+1}. ${element.destination}</span>  ${controls}
    `;
    li.querySelector('.delete').addEventListener('click', () => {
        deleteElement(element.destination, element.id);
    });
    li.querySelector('.edit').addEventListener('click', () => {
        editElement(element.destination, element.id);
    });
    return li;
}
updateButton.addEventListener('click', updateElement);
cancelButton.addEventListener('click', cancelEdit);
fetchData();