interface RoleToggleProps {
  selectedRole: "teen" | "parent";
  onSelectRole: (role: "teen" | "parent") => void;
}

function RoleToggle({ selectedRole, onSelectRole }: RoleToggleProps) {
  return (
    <div className="relative flex w-[80%] mx-auto h-10 bg-gray-100 rounded-full overflow-hidden">
      <div
        // className={`absolute top-0 left-0 h-full w-1/2 bg-purple-300 rounded-full transition-transform duration-300 ease-in-out ${selectedRole === "parent" ? "translate-x-full" : ""}`}
        className={`absolute top-[5px] left-[5px] right-[5px] h-[30px] w-[calc(50%-5px)] bg-purple-300 rounded-full transition-transform duration-300 ease-in-out ${selectedRole === "parent" ? "translate-x-full" : ""}`}
      />

      <button
        type="button"
        onClick={() => onSelectRole("teen")}
        className={`flex-1 z-10 text-sm font-medium transition-colors duration-200 ${
          selectedRole === "teen" ? "text-white" : "text-gray-700"
        }`}
      >
        Teen
      </button>
      <button
        type="button"
        onClick={() => onSelectRole("parent")}
        className={`flex-1 z-10 text-sm font-medium transition-colors duration-200 ${
          selectedRole === "parent" ? "text-white" : "text-gray-700"
        }`}
      >
        Parent
      </button>
    </div>
  );
}

export default RoleToggle;
