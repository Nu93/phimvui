const express = require('express');
const app = express();
const port = 3000;
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
const bodyParser = require('body-parser');
const { addUser, getAllUsers, deleteUser, updateUser, addFilm, getAllFilms, deleteFilm, updateFilm, addAdmin, getAllAdmins, deleteAdmin, updateAdmin } = require('./src/handlers');
const findUser = require('./src/login');
const findAdmin = require('./src/loginad');
const mongoose = require('mongoose');
const { User, Film, Admin } = require('./src/models');
const session = require('express-session');
app.use(express.static('public'));
const staticPath = '/public';
app.use(staticPath, express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));
const multer = require('multer');

//kết nối mongo
const dbName = 'test';
const atlasUri = 'mongodb+srv://dungaka0804:dung2002@cluster0.3lkddwd.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(atlasUri, { useNewUrlParser: true, useUnifiedTopology: true });
const client = mongoose.connection;
client.on('error', console.error.bind(console, 'Kết nối MongoDB thất bại:'));
client.once('open', function () {
    console.log('Kết nối MongoDB thành công!');
});

const connectDB = async () => {
  try {
    const client = new MongoClient(atlasUri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db(dbName);
    return db;
    client.close();
  } catch (error) {
    console.error('Error connecting to the database', error);
    throw error;
  }
};

// chuyen home
app.get('/', async (req, res) => {
  try {

    const films = await Film.find();
    // Render trang index với dữ liệu bộ phim
    res.render('index', { films:films });
  } catch (error) {
    console.error('Lỗi khi truy vấn dữ liệu bộ phim', error);
    res.status(500).send('Internal Server Error');
  }
});

            //User
//đăng ký user
app.post('/addUser', async (req, res) => {
  try {
    const savedUser = await addUser(req.body);
    console.log('Đăng ký thành công!!');
    res.sendFile(path.join(__dirname, './public/dangnhap.html'));
    
  } catch (error) {
    res.status(500).send('Lỗi khi thêm người dùng');
  }
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//đăng nhập user
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Kiểm tra xem người dùng có tồn tại không
    const films = await Film.find();
    const user = await User.findOne({ username, password });

    if (user) {
      res.render('index', { films:films })
      } else {
        res.status(401).send('Sai tài khoản hoặc mật khẩu');
    } 
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Lỗi server');
  }
});

// render data lên page
app.get('/users', async (req, res) => {
  const db = await connectDB();
  const users = await db.collection('users').find().toArray(); 
  res.render('user-manager', { users });
});

// xóa user
async function deleteUserFromDB(userId) {
  const db = await connectDB(); // Sử dụng hàm kết nối cơ sở dữ liệu đã có
  await db.collection('users').deleteOne({ _id: ObjectId(userId) });
  console.log(`Người dùng với ID ${userId} đã được xóa.`);
}

app.get('/delete/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    // Thực hiện logic xóa người dùng với userId từ cơ sở dữ liệu
    await deleteUserFromDB(userId);
    res.redirect('/users'); // Chuyển hướng về trang danh sách người dùng sau khi xóa
  } catch (error) {
    console.error('Lỗi xóa người dùng', error);
    res.status(500).send('Internal Server Error');
  }
});


            // admin
// Login
app.post('/loginadmin', async (req, res) => {
  const { name, pass } = req.body;
  try {
    // Kiểm tra xem người dùng có tồn tại không
    const admin = await Admin.findOne({ name, pass });
    if (admin) {
        res.send('Đăng nhập thành công');
      } else {
        res.status(401).send('Sai tài khoản hoặc mật khẩu');
    } 
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Lỗi server');
  }
});

//đăng ký admin
app.post('/addAdmin', async (req, res) => {
  try {
    const savedAdmin = await addAdmin(req.body);
    console.log('Đăng ký thành công!!');  
  } catch (error) {
    res.status(500).send('Lỗi khi thêm người dùng');
  }
});

// render data admin
app.get('/admins', async (req, res) => {
  const db = await connectDB();
  const admins = await db.collection('admins').find().toArray(); 
  res.render('admin-manager', { admins });
});

// xóa
app.get('/delete/:adminId', async (req, res) => {
  const adminId = req.params.adminId;

  try {
    // Thực hiện logic xóa admin với adminId từ cơ sở dữ liệu
    await deleteAdminById(adminId);
    res.redirect('/admin'); // Chuyển hướng về trang danh sách admin sau khi xóa
  } catch (error) {
    console.error('Lỗi xóa admin', error);
    res.status(500).send('Internal Server Error');
  }
});

async function deleteAdminById(adminId) {
  const db = await connectDB(); // Sử dụng hàm kết nối cơ sở dữ liệu đã có
  await db.collection('admins').deleteOne({ _id: ObjectId(adminId) });
  console.log(`Admin với ID ${adminId} đã được xóa.`);
}

// sửa admin
async function getAdminById(adminId) {
  const db = await connectDB(); // Sử dụng hàm kết nối cơ sở dữ liệu đã có
  const admin = await db.collection('admins').findOne({ _id: ObjectId(adminId) });
  return admin;
}

app.get('/edit/:adminId', async (req, res) => {
  const adminId = req.params.adminId;
  try {
    // Thực hiện logic lấy thông tin admin với adminId từ cơ sở dữ liệu
    const admin = await getAdminById(adminId);
    // Render trang chỉnh sửa admin và truyền thông tin admin vào view
    res.render('edit-admin', { admin });
  } catch (error) {
    console.error('Lỗi lấy thông tin admin', error);
    res.status(500).send('Internal Server Error');
  }
});

async function updateAdminById(adminId, updatedAdminData) {
  const db = await connectDB(); // Sử dụng hàm kết nối cơ sở dữ liệu đã có

  await db.collection('admins').updateOne(
    { _id: ObjectId(adminId) },
    { $set: updatedAdminData }
  );
  console.log(`Thông tin admin với ID ${adminId} đã được cập nhật.`);
}

app.post('/update/:adminId', async (req, res) => {
  const adminId = req.params.adminId;
  const updatedAdminData = req.body;
  try {
    // Thực hiện logic cập nhật thông tin admin với adminId từ cơ sở dữ liệu
    await updateAdminById(adminId, updatedAdminData);
    res.redirect('/admins'); // Chuyển hướng về trang danh sách admin sau khi cập nhật
  } catch (error) {
    console.error('Lỗi cập nhật thông tin admin', error);
    res.status(500).send('Internal Server Error');
  }
});

    //phim

app.get('/films', async (req, res) => {
  const db = await connectDB();
  const films = await db.collection('films').find().toArray(); 
  res.render('film-manager', { films });
});

//thêm film

// up thumbnail
// Cấu hình Multer để lưu trữ ảnh trong thư mục 'uploads'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

app.get('/new-film', (req, res) => {
  res.render('new-film'); // Render trang thêm film mới
});

// Route để xử lý yêu cầu thêm bộ phim mới
app.post('/add-film', upload.single('thumbnail'), async (req, res) => { 
  try {
    const { movieTitle, movieDescription, linkfilm } = req.body;

    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    // Dữ liệu mới từ form
    const newFilm = new Film({
      movieTitle: movieTitle,
      movieDescription: movieDescription,
      linkfilm: linkfilm,
      thumbnail: `/images/${req.file.filename}`, // Lưu đường dẫn của ảnh trong cơ sở dữ liệu
    });
    // Thêm bộ phim mới vào cơ sở dữ liệu
    await newFilm.save();

    res.redirect('/films');
  } catch (error) {
    console.error('Lỗi khi thêm bộ phim mới', error);
    res.status(500).send('Internal Server Error');
  }
});


//sửa 
app.get('/edit-film/:id', async (req, res) => {
  try {
    const db = await connectDB(); // Sử dụng hàm kết nối cơ sở dữ liệu
    const collection = db.collection('films');
    // Lấy thông tin film dựa trên ID
    const filmId = new ObjectId(req.params.id);
    const film = await collection.findOne({ _id: filmId });
    // Render form sửa thông tin film
    res.render('edit-film', { film });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin film', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route để xử lý yêu cầu cập nhật thông tin film
app.post('/update-film/:id', async (req, res) => {
  try {
    const db = await connectDB(); // Sử dụng hàm kết nối cơ sở dữ liệu
    const collection = db.collection('films');
    // Lấy ID của film cần cập nhật
    const filmId = new ObjectId(req.params.id);
    // Dữ liệu mới từ form
    const updatedFilmData = {
      movieTitle: req.body.movieTitle,
      movieDescription: req.body.movieDescription,
      linkfilm: req.body.linkfilm,
      thumbnail: req.body.thumbnail
    };
    // Cập nhật thông tin film
    await collection.updateOne({ _id: filmId }, { $set: updatedFilmData });

    res.redirect('/films');
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin film', error);
    res.status(500).send('Internal Server Error');
  }
});

// xóa film 
app.get('/delete-film/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection('films');
    // Lấy ID của film cần xóa
    const filmId = new ObjectId(req.params.id);
    // Xóa bộ phim từ cơ sở dữ liệu
    await collection.deleteOne({ _id: filmId });

    res.redirect('/films');
  } catch (error) {
    console.error('Lỗi khi xóa bộ phim', error);
    res.status(500).send('Internal Server Error');
  }
});


//chuyen xem film
app.get('/watch/:filmId', async (req, res) => {
  try {
    const filmId = req.params.filmId;
    // Truy vấn thông tin của bộ phim từ cơ sở dữ liệu dựa trên filmId
    const film = await Film.findById(filmId);

    // Render trang xem phim với dữ liệu bộ phim
    res.render('watch-film.ejs', { film: film });
  } catch (error) {
    console.error('Lỗi khi truy vấn dữ liệu bộ phim', error);
    res.status(500).send('Internal Server Error');
  }
});

// chuyen form phim moi
app.get('/newfilm', (req, res) => {
  res.sendFile(path.join(__dirname, './public/theloai.html'));
});

// chuyen form the loai
app.get('/theloai', (req, res) => {
  res.sendFile(path.join(__dirname, './public/theloai.html'));
});

// chuyen form dang nhap
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, './public/dangnhap.html'));
});

// chuyen form dang ky
app.get('/registration', (req, res) => {
  res.sendFile(path.join(__dirname, './public/dangky.html'));
});

//chuyen form dang nhap admin
app.get('/adminlogin', (req, res) => {
  res.sendFile(path.join(__dirname, './public/loginadmin.html'));
});

//chuyen form dang ky admin
app.get('/adminregis', (req, res) => {
  res.sendFile(path.join(__dirname, './public/registeradmin.html'));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
