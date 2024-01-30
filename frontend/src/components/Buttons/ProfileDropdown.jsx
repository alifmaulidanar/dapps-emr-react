import { Select } from "antd";

function ProfileDropdown({ patients, onChange, defaultValue }) {
  return (
    <>
      <div className="justify-self-end">
        <Select
          key={defaultValue}
          showSearch
          defaultValue={defaultValue}
          optionFilterProp="children"
          onChange={onChange}
          options={patients.map((patient) => ({
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
