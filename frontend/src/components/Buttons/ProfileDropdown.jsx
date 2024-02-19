import { Select } from "antd";

function ProfileDropdown({ users, onChange, defaultValue }) {
  return (
    <>
      <div className="justify-self-end w-[150px]">
        <Select
          key={defaultValue}
          defaultValue={defaultValue}
          optionFilterProp="children"
          onChange={onChange}
          options={users.map((patient) => ({
            value: patient.nomorIdentitas,
            label: patient.namaLengkap,
          }))}
          style={{ width: "100%" }}
        />
      </div>
    </>
  );
}

export default ProfileDropdown;
