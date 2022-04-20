const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/crud', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

// Membuat schema


// //Menambah 1 data
// const contact2 = new Contact({
//     nama: 'Muhammad Usman',
//     nohp: '081818848561',
//     email: 'haikal@gmail.com',
// });

// //Simpan ke collection
// contact2.save().then((contact) => console.log(contact));