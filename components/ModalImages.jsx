"use client";
import { useState, useEffect } from "react";
import { Modal } from "antd";

export default function ModalImages() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setOpen(true);
  }, []);

  const images = [
    {
      src: "/images/Customer_Satisfaction_Survey.jpg",
      link: "https://forms.office.com/r/zjd39SmGTF?origin=lprLink",
    }
  ];

  // Next / Prev
  const next = () => setPage((prev) => (prev + 1) % images.length);
  const prev = () =>
    setPage((prev) => (prev - 1 + images.length) % images.length);

  // Auto change every 5 sec
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setPage((prev) => (prev + 1) % images.length);
    }, 30000);
    return () => clearInterval(interval);
  }, [open]);

  return (
    <>
      <Modal
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
        width={1000}
        centered
        style={{ padding: 0, zIndex: 999999, borderRadius: 8 }}
      >
        <div style={{ textAlign: "center" }}>
          <a href={images[page].link} target="_blank" rel="noopener noreferrer">
            <img
              src={images[page].src}
              style={{ width: "100%", borderRadius: 8, cursor: "pointer" }}
              alt="modal-img"
            />
          </a>
        </div>
      </Modal>
    </>
  );
}
