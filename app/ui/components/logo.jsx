const Logo = ({ className = "" }) => {
  return (
    <div className={className}>
      <h1 className="text-5xl font-bold text-blue-600">
        Reliant-<span className="text-slate-700">CRM</span>
      </h1>
    </div>
  );
};

export default Logo;

