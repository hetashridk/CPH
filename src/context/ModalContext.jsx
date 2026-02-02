import React, { createContext, useContext, useState } from 'react';
import RegistrationModal from '../components/RegistrationModal';
import FreeSampleModal from '../components/FreeSampleModal';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [modalData, setModalData] = useState(null);

    const openModal = (data = null) => {
        setModalData(data);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setModalData(null);
    };

    return (
        <ModalContext.Provider value={{ isModalOpen, openModal, closeModal }}>
            {children}
            {modalData?.type === 'free-sample' ? (
                <FreeSampleModal isOpen={isModalOpen} onClose={closeModal} />
            ) : (
                <RegistrationModal isOpen={isModalOpen} onClose={closeModal} initialData={modalData} />
            )}
        </ModalContext.Provider>
    );
};
