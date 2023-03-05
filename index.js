const encode = (input) => {
  return btoa(input);
}

const saveKey = () => {
  // Grab text from input box
  const input = document.getElementById("key_input");

  if (input) {
    const { value } = input;

    // Encode String
    const encodeValue = encode(value);

    // Save to google storage
    chrome.storage.local.set({ 'openai-key': encodeValue }, () => {
      document.getElementById("key_needed").style.display = 'none'
      document.getElementById("key_entered").style.display = 'block'
    });
  }
};

const changeKey = () => {
  document.getElementById('key_needed').style.display = 'block';
  document.getElementById("key_entered").style.display = 'none';

}


const checkForKey = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['openai-key'], (result) => {
      resolve(result['openai-key']);
    });
  });
};

checkForKey().then((response) =>{
  if(response){
    document.getElementById('key_needed').style.display = 'none';
    document.getElementById('key_entered').style.display='block';
  }
})


document.getElementById("save_key_button").addEventListener("click", saveKey);
document.getElementById("change_key_button").addEventListener("click", changeKey);


