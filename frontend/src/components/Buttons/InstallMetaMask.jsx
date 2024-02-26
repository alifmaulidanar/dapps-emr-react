import { useState } from "react";
import { Button, Modal, Steps } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

const steps = [
  {
    title: "Situs MetaMask",
    content: (
      <div className="flex flex-col gap-y-4">
        <p>
          Kunjungi situs web resmi{" "}
          <a
            className="text-blue-700"
            href="https://metamask.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            MetaMask
          </a>
          . Klik "Unduh untuk ..." sesuai dengan browser Anda.
        </p>
        <img
          src="/images/metamask-installation/metamaskio.png"
          alt=""
          width={600}
          height={600}
          className="mx-auto rounded-xl"
        />
      </div>
    ),
  },
  {
    title: "Tambahkan ke Browser",
    content: (
      <div className="flex flex-col gap-y-4">
        <p>
          Selanjutnya, Anda akan diarahkan ke halaman toko ekstensi browser.
          Klik "Tambahkan ke ..." sesuai dengan browser Anda.
        </p>
        <img
          src="/images/metamask-installation/metamask-ext.png"
          alt=""
          width={600}
          height={600}
          className="mx-auto rounded-xl"
        />
      </div>
    ),
  },
  {
    title: "Buat Akun MetaMask",
    content: (
      <div className="flex flex-col gap-y-4">
        <div>
          <p>
            Berikutnya, Anda perlu membuat akun MetaMask pribadi terlebih
            dahulu. Ikuti langkah-langkah berikut.
          </p>
          <ol>
            <li>1. Pilih "Create a new wallet" dan buat kata sandi Anda.</li>
            <li>
              2. Simpan kata sandi dengan baik karena akan dibutuhkan setiap
              kali Anda ingin masuk ke MetaMask.
            </li>
            <li>3. Ikuti proses pembuatan akun hingga selesai.</li>
          </ol>
        </div>
        <img
          src="/images/metamask-installation/metamask-signup.png"
          alt=""
          width={600}
          height={600}
          className="mx-auto rounded-xl"
        />
      </div>
    ),
  },
  {
    title: "Impor Akun MetaMask",
    content: (
      <div className="flex flex-col gap-y-4">
        <div>
          <p>
            Langkah terakhir, Anda hanya perlu mengimpor akun ke MetaMask
            menggunakan private key yang telah diberikan pada tahap pendaftaran
            akun sebelumnya. Ikuti langkah-langkah berikut.
          </p>
          <ol>
            <li>
              1. Klik "Account 1" atau nama akun MetaMask Anda pada bagian atas,
              kemudian pilih "Add account ..." dan pilih "Import account".
            </li>
            <li>
              2. Pilih tipe "Private Key", kemudian masukkan private key dari
              informasi akun yang telah disalin sebelumnya dan klik "Import".
            </li>
            <li>3. Akun MetaMask berhasil diimpor.</li>
            <li>
              4. Setelah ini, tekan tombol "Hubungkan MetaMask" sebelum
              memasukkan email dan kata sandi. Lalu, ikuti petunjuk di MetaMask.
            </li>
          </ol>
        </div>
        <img
          src="/images/metamask-installation/metamask-import.png"
          alt=""
          width={600}
          height={600}
          className="mx-auto rounded-xl"
        />
      </div>
    ),
  },
];

const InstallMetaMask = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [current, setCurrent] = useState(0);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleNext = () => {
    setCurrent(current + 1);
  };

  const handlePrev = () => {
    setCurrent(current - 1);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    setCurrent(0);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setCurrent(0);
  };

  return (
    <>
      <Button
        type="button"
        onClick={showModal}
        className="inline-flex items-center p-5 text-sm font-medium text-center text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50"
      >
        <InfoCircleOutlined />
        Cara Pasang MetaMask
      </Button>
      <Modal
        title="Pasang Ekstensi MetaMask"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        width={1000}
        centered
      >
        <Steps current={current} size="small" className="my-8">
          {steps.map((item) => (
            <Steps.Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <div style={{ marginTop: 20, marginBottom: 20 }}>
          {steps[current].content}
        </div>
        <div style={{ textAlign: "center" }}>
          {current > 0 && (
            <Button style={{ margin: "0 8px" }} onClick={handlePrev}>
              Sebelumnya
            </Button>
          )}
          {current < steps.length - 1 && (
            <Button type="default" onClick={handleNext}>
              Selanjutnya
            </Button>
          )}
          {current === steps.length - 1 && (
            <Button type="default" onClick={handleOk}>
              Selesai
            </Button>
          )}
        </div>
      </Modal>
    </>
  );
};

export default InstallMetaMask;
