import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import NoteCard from '../components/Cards/NoteCard'
import { MdAdd, MdOutlineAlarmAdd } from 'react-icons/md'
import AddEditNotes from './AddEditNotes'
import Modal from "react-modal"
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance';
import { Toast } from '../components/ToastMessages/Toast'

const Home = () => {

  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    date: null,
  });

  const [showToastMsg, setShowToastMsg] = useState({
    isShown: false,
    message: "",
    type: "add",
  });

  const [allNotes, setAllNotes] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [isSearch, setIsSearch] = useState(false);

  const navigate = useNavigate();


  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({ isShown: true, data: noteDetails, type: "edit" });
  };

  const showToastMessage = (message, type) => {
    setShowToastMsg({
      isShown: true,
      message,
      type,
    })
  }

  const handleCloseToast = () => {
    setShowToastMsg({
      isShown: false,
      message: "",
    })
  }

  //Get User Info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");

      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }

    } catch (error) {
      if (error.response.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    }
  };

  //Get all Notes
  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/get-all-notes");

      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log("An unexpectes error has occured. Please try again later");
    }
  }

  //Delete Note
  const deleteNote = async (data) => {
    const noteId = data._id

    try {
      const response = await axiosInstance.delete('/delete-note/' + noteId);

      if (response.data && !response.data.error) {
        showToastMessage("Note Deleted Successfully", 'delete');
        getAllNotes();
      }

    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        console.log("An unexpectes error has occured. Please try again later");
      }
    }
  }

  //Search Note
  const onSearchNote = async (query) => {
    try {
      const response = await axiosInstance.get("/search-notes/", { params: { query }, });

      if (response.data && response.data.notes) {
        setIsSearch(true);
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log(error);
    }
  }

  //IsPinned
  const updateIsPinned = async (noteDate) => {
    
  }

  const handleClearSearch = () => {
    setIsSearch(false);
    getAllNotes();
  };

  useEffect(() => {
    getAllNotes();
    getUserInfo();
    return () => { };

  }, []);


  return <>

    <Navbar
      userInfo={userInfo}
      onSearchNote={onSearchNote}
      handleClearSearch={handleClearSearch}
    />

    <div className='container mx-auto'>
      <div className='grid grid-cols-3 gap-4 mt-8'>
        {allNotes.length > 0 ? (
          allNotes.map((item) => (
            <NoteCard
              key={item._id}
              title={item.title}
              date={item.createOn}
              content={item.content}
              tags={item.tags}
              isPinned={item.isPinned}
              onEdit={() => handleEdit(item)}
              onDelete={() => deleteNote(item)}
              onPinNote={() => { }}
            />
          ))
        ) : (
          <div>No notes available</div>
        )}

      </div>
    </div>

    <button className='w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10'
      onClick={() => {
        setOpenAddEditModal({ isShown: true, type: "add", data: null });
      }}>
      <MdAdd className='text-[32px] text-white' />
    </button>


    <Modal
      isOpen={openAddEditModal.isShown}
      onRequestClose={() => { }}
      style={{
        overlay: {
          backgroundColor: "rgba(0,0,0,0.2)",
        },
      }}
      contentLabel=""
      className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 "
    >
      <AddEditNotes
        type={openAddEditModal.type}
        noteDate={openAddEditModal.data}
        onClose={() => {
          setOpenAddEditModal({ isShown: false, type: "add", data: null });
        }}
        getAllNotes={getAllNotes}
        showToastMessage={showToastMessage}
      />
    </Modal>

    <Toast
      isShown={showToastMsg.isShown}
      message={showToastMsg.message}
      type={showToastMsg.type}
      onClose={handleCloseToast}
    />



  </>
}

export default Home