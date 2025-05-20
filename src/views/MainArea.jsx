export default function Contacts() {
    return (
        <div className="h-dvh bg-gray-800 w-80 flex flex-col">
            {/* Búsqueda */}
            <div className="p-4 border-b border-gray-700">
                <input
                    type="text"
                    placeholder="Buscar contactos..."
                    className="w-full px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            {/* Lista de contactos */}
            <div className="flex-1 overflow-y-auto">
                {[...Array(10)].map((_, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 hover:bg-gray-700 cursor-pointer border-b border-gray-700">
                        <div className="w-10 h-10 rounded-full bg-indigo-400"></div>
                        <div className="text-white">
                            <div className="font-medium">Nombre {idx + 1}</div>
                            
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
