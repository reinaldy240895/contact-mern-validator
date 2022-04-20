const express = require('express')
const expressLayouts = require('express-ejs-layouts');

const { body, validationResult, check } = require('express-validator');

const methodOverride = require('method-override')

const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')

require('./utils/db');
const Contact = require('./model/contact');

const app = express();
const port = 3000;

//setup method override
app.use(methodOverride('_method'))

// setup ejs
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}));

//Konfigurasi flash
app.use(cookieParser('secret'));
app.use(session({
    cookie: {maxAge: 6000},
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
})
)
app.use(flash());

//Halaman home
app.get('/', (req, res) => {
    const mahasiswa = [
        {
            nama: 'Muhammad Haikal',
            email: 'muhammadhaikal@outlook.com',
        },
        {
            nama: 'Muhammad Usman',
            email: 'muhammadhaikal@outlook.com',
        },
        {
            nama: 'Muhammad Arif',
            email: 'muhammadhaikal@outlook.com',
        },
    ];
    res.render('index', { 
        nama: 'Muhammad Haikal',
        title: 'Halaman Home',
        mahasiswa,
        layout: 'layouts/main-layout',
    });
})

//Halaman about
app.get('/about', (req, res, next)  => {
    res.render('about', {
        layout: 'layouts/main-layout',
        title: 'Halaman About',
    });
})

//Halaman contact
app.get('/contact', async (req, res) => {
    const contacts = await Contact.find();
    
    res.render('contact', {
        layout: 'layouts/main-layout',
        title: 'Halaman Contact',
        contacts,
        msg: req.flash('msg'),
        });

    // Contact.find().then((Contact) => {
    //     res.send(Contact);
    // })
})

//halaman form tambah data contact
app.get('/contact/add', (req, res) => {
    res.render('add-contact', {
        title: 'Form Tambah Kontak',
        layout: 'layouts/main-layout',
    })
});

//Proses tambah data kontak
app.post(
    '/contact', 
    [
    body('nama').custom(async (value) => {
        const duplikat = await Contact.findOne({ nama: value });
        if(duplikat) {
            throw new Error('Nama telah digunakan!');
        }
        return true;
    }),
    check('email', 'Email tidak valid!').isEmail(), 
    check('nohp', 'Nomor Telepon Salah!').isMobilePhone('id-ID'),
    ],
     (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        res.render('add-contact', {
            title: 'Form Tambah Kontak',
            layout: 'layouts/main-layout',
            errors: errors.array(),
        })
    } else {
            Contact.insertMany(req.body, (error, result) => {
            req.flash('msg', 'Data Kontak telah ditambahkan!');
            res.redirect('/contact');
        });
    }
    
})

// Proses delete kontak
// app.get('/contact/delete/:nama', async (req, res) => {
//     const contact = await Contact.findOne({nama: req.params.nama});
//     //jika contact tidak ada
//     if(!contact) {
//         res.status(404);
//         res.send('<h1>404</h1>');
//     } else {
//         Contact.deleteOne({ _id: contact._id})
//         //Kirimkan flash message
//         .then((result) => {
//             req.flash('msg', 'Data Kontak telah dihapus!')
//             res.redirect('/contact');
//         });
//     }
// })


app.delete('/contact', (req, res) => {
    // res.send(req.body);
    Contact.deleteOne({ nama: req.body.nama })
        //Kirimkan flash message
        .then((result) => {
            req.flash('msg', 'Data Kontak telah dihapus!')
            res.redirect('/contact');
        });
})

//form ubah data contact
app.get('/contact/edit/:nama', async (req, res) => {
    const contact = await Contact.findOne({nama : req.params.nama});
    
    res.render('edit-contact', {
        title: 'Form Ubah Kontak',
        layout: 'layouts/main-layout',
        contact,
    })
})

//Proses ubah data
app.put('/contact',
 [
    body('nama').custom(async (value, { req }) => {
        const duplikat = await Contact.findOne({nama: value});
        if(value !== req.body.oldNama && duplikat) {
            throw new Error('Nama telah digunakan!');
        }
        return true;
    })],
    check('email', 'Email tidak valid!').isEmail(), 
    check('nohp', 'Nomor Telepon Salah!').isMobilePhone('id-ID'),
     (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        res.render('edit-contact', {
            title: 'Form Ubah Kontak',
            layout: 'layouts/main-layout',
            errors: errors.array(),
            contact: req.body,
        })
    } else {
        // res.send(req.body());
        Contact.updateOne({_id: req.body._id},
            {
                $set: {
                    nama: req.body.nama,
                    email: req.body.email,
                    nohp: req.body.nohp,
                }
            }).then((result) => {
                //Kirimkan flash message
                req.flash('msg', 'Data Kontak telah diubah!');
                res.redirect('/contact');
            });
    }
    
})

//halaman detail kontak
app.get('/contact/:nama', async (req, res) => {
    // const contact = findContact(req.params.nama);
    const contact = await Contact.findOne({ nama: req.params.nama });
    
    res.render('detail', {
        layout: 'layouts/main-layout',
        title: 'Halaman Detail Contact',
        contact,
        });
})


app.listen(port, () => {
    console.log(`Mongo Contact App | listening at http://localhost:${port}`);
});

