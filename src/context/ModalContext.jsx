import React, { createContext, useContext, useState } from 'react';
import RegistrationModal from '../components/RegistrationModal';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <ModalContext.Provider value={{ isModalOpen, openModal, closeModal }}>
            {children}
            <RegistrationModal isOpen={isModalOpen} onClose={closeModal} />
        </ModalContext.Provider>
    );
};
