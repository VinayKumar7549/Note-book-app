import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import NoteCard from '../components/Cards/NoteCard'
import { MdAdd, MdOutlineAlarmAdd } from 'react-icons/md'
import AddEditNotes from './AddEditNotes'
import Modal from "react-modal"
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance';
import moment from 'moment';

const Home = () => {

  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShow: false,
    type: "add",
    date: null,
  });

  const [allNotes, setAllNotes] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

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
  const getNotes = async () => {
    try {
      const response = await axiosInstance.get("/get-all-notes");

      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log("An unexpectes error has occured. Please try again later");
    }
  }

  useEffect(() => {
    getNotes();
    getUserInfo();
    return () => { };

  }, []);


  return <>

    <Navbar userInfo={userInfo} />

    <div className='container mx-auto'>
      <div className='grid grid-cols-3 gap-4 mt-8'>
        {allNotes.length > 0 ? (
          allNotes.map((item) => (
            <NoteCard
              key={item._id}
              title={item.title}
              date={moment(item.createOn).format('Do MMM YYYY')}
              content={item.content}
              tags={item.tags}
              isPinned={item.isPinned}
              onEdit={() => { }}
              onDelete={() => { }}
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
        setOpenAddEditModal({ isShow: true, type: "add", data: null });
      }}>
      <MdAdd className='text-[32px] text-white' />
    </button>


    <Modal
      isOpen={openAddEditModal.isShow}
      onRequestClose={() => { }}
      style={{
        overlay: {
          backgroundColor: "rgba(0,0,0,0.2)",
        },
      }}
      contentLabel=""
      className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll  "
    >
      <AddEditNotes
        type={openAddEditModal.type}
        noteDate={openAddEditModal.data}
        onClose={() => {
          setOpenAddEditModal({ isShow: false, type: "add", data: null });
        }} />
    </Modal>


  </>
}

export default Home