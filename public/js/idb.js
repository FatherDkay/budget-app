// create variable to hold db connection
let db;
// establish a connection to IndexedDB database called 'budgetApp' and set it to version 1
const request = indexedDB.open("budgetapp", 1);

// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function(event) {
    // save a reference to the database 
    const db = event.target.result;
        // create an object store (table) called `new_budget`, set it to have an auto incrementing primary key of sorts 
    db.createObjectStore("new_transaction", { autoIncrement: true });
};

  // upon a successful 
  request.onsuccess = function(event) {
    db = event.target.result;
};

// upon an error
request.onerror = function(event) {
    console.log(event.target.errorCode);
};

// Save without internet connection
function saveRecord(record) {
    const transaction = db.transaction(["new_transaction"], "readwrite");
    const budgetObjectStore = transaction.objectStore("new_transaction");
    budgetObjectStore.add(record);
};
// Upload when connected
function uploadTransaction() {
    const transaction = db.transaction(["new_transaction"], "readwrite");
    const budgetObjectStore = transaction.objectStore("new_transaction");
    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application.json"
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(["new_transaction"], "readwrite");
                const budgetObjectStore = transaction.objectStore("new_transaction");
                budgetObjectStore.clear();
                alert('All transactions are online');
            })
            .catch(err => {
                console.log(err);
            })
        }
    }
}

window.addEventListener("online", uploadTransaction);