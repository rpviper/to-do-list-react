import { useEffect, useState } from "react";
import Header from "./Header";
import SearchItem from "./SearchItem";
import AddItem from "./AddItem";
import Content from "./Content";
import Footer from "./Footer";
import apiRequest from "./apiRequest";

function App() {
  const API_URL = "http://localhost:3500/items";

  // This was the code before we had API, and used localstorage
  /* const [items, setItems] = useState(
    JSON.parse(localStorage.getItem("shoppinglist")) || [] // If we don't add the empty array, new users would get an error
    ); */

  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [search, setSearch] = useState("");
  const [fetchError, setFetchError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /*const setLocalStorage = (newItems) => {
    setItems(newItems);
    localStorage.setItem("shoppinglist", JSON.stringify(newItems));
  }; */

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw Error("Did not fetch data");
        const listItems = await response.json();
        setItems(listItems);
        setFetchError(null);
      } catch (error) {
        setFetchError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, []);

  const addItem = async (item) => {
    // Do we have items at all? If yes then we take the last item (it's zero based so -1)
    // and add +1 for new id, or if no items, start from 1 (tenary : 1)
    const toUpper = item.charAt(0).toUpperCase() + item.slice(1).toLowerCase();
    const id = items.length ? parseInt(items[items.length - 1].id) + 1 : 1;
    const myNewItem = { id, checked: false, item: toUpper };
    const listItems = [...items, myNewItem];
    setItems(listItems);
    // setLocalStorage(listItems);

    const postOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(myNewItem),
    };
    const result = await apiRequest(API_URL, postOptions);
    if (result) setFetchError(result);
  };

  const handleCheck = async (id) => {
    const listItems = items.map(
      (item) => (item.id === id ? { ...item, checked: !item.checked } : item) // Swop the checked sign on or off
    );
    setItems(listItems);
    // setLocalStorage(listItems);

    const myItem = listItems.filter((item) => item.id === id);
    const updateOptions = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked: myItem[0].checked }),
    };
    const requestUrl = `${API_URL}/${id}`;
    const result = await apiRequest(requestUrl, updateOptions);
    if (result) setFetchError(result);
  };

  const handleDelete = async (id) => {
    const listItems = items.filter((item) => item.id !== id);
    setItems(listItems);
    // setLocalStorage(listItems);

    const deleteOptions = { method: "DELETE" };
    const requestUrl = `${API_URL}/${id}`;
    const result = await apiRequest(requestUrl, deleteOptions);
    if (result) setFetchError(result);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newItem) return;
    addItem(newItem);
    setNewItem(""); // When submitting, clear the input field
  };

  return (
    <div className="App">
      <Header title="Grocery List" />
      <AddItem
        newItem={newItem}
        setNewItem={setNewItem}
        handleSubmit={handleSubmit}
      />
      <SearchItem search={search} setSearch={setSearch} />
      <main>
        {isLoading && <p>Loading Items...</p>}
        {fetchError && (
          <p style={{ color: "red" }}>{`Error: ${fetchError}`} </p>
        )}
        {!fetchError && !isLoading && (
          <Content
            items={items.filter((item) =>
              item.item.toLowerCase().includes(search.toLowerCase())
            )}
            handleCheck={handleCheck}
            handleDelete={handleDelete}
          />
        )}
      </main>
      <Footer length={items.length} />
    </div>
  );
}

export default App;
