const readline = require('readline');
const { findAndPublishPropertiesWithoutMeta } = require('./publishController');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const mainMenu = () => {
    rl.question(
        'Seleccione una opción:\n1. Buscar propiedades sin la etiqueta "Meta" y publicarlas\n',
        async (option) => {
            switch (option) {
                case '1':
                    await findAndPublishPropertiesWithoutMeta();
                    break;
                default:
                    console.log('Opción no válida. Intente nuevamente.');
                    mainMenu();
                    break;
            }
            rl.close();
        }
    );
};

module.exports = { mainMenu };
