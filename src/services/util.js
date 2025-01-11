const util = {
    formatTimestamp: (timestamp) => {
        const date = new Date(Number(timestamp));
    
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based in JavaScript
        const hours24 = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
    
        const ampm = hours24 >= 12 ? 'PM' : 'AM';
        const hours12 = (hours24 % 12 || 12).toString().padStart(2, '0'); // Convert to 12-hour format
    
        return `${day}/${month} ${hours12}:${minutes} ${ampm}`;
    },

    generateRandomId: () => {
        const randomPart = Math.random().toString(36).substring(2); // Generates a random string
        const timePart = Date.now().toString(36); // Adds the current timestamp in base 36
        return randomPart + timePart;
    }
}

export default util
