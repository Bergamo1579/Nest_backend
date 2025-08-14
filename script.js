const fs = require('fs');
const axios = require('axios');

const AUTH_TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IkY4RTU4Qzg0MjRBRTlEM0Q1Q0M3QTc3NjdBRDc0NzkxMUVENDVENzFSUzI1NiIsInR5cCI6ImF0K2p3dCIsIng1dCI6Ii1PV01oQ1N1blQxY3g2ZDJldGRIa1I3VVhYRSJ9.eyJuYmYiOjE3NTMyMzY2NDUsImV4cCI6MTc1MzI0MDI0NSwiaXNzIjoiaHR0cHM6Ly9hcGkubGV4LmVkdWNhdGlvbi9zc28iLCJhdWQiOlsiY29uZXhpYSIsImh0dHBzOi8vYXBpLmxleC5lZHVjYXRpb24vc3NvL3Jlc291cmNlcyJdLCJjbGllbnRfaWQiOiJjb25leGlhIiwic3ViIjoiMjNiYTQwMWEtZDNjNi00Njc5LWIwNTItNGI3ZTZhN2RjYjkzIiwiYXV0aF90aW1lIjoxNzUzMjM2NjQ1LCJpZHAiOiJsb2NhbCIsIlRva2VuVHlwZSI6IkxlZ2FjeUJ5U3NvVjIiLCJqdGkiOiJBRkU5NDNCQjFGMkZDODcwQTIzOEMyQTU5OUU0NkE0RSIsImlhdCI6MTc1MzIzNjY0NSwiVGVuYW50SWQiOiJiNWJhZmMxMC0zZGRkLTRmNmQtYjkxOS02M2NmNzVjMGFjMDkiLCJVc2VySWQiOiIyM2JhNDAxYS1kM2M2LTQ2NzktYjA1Mi00YjdlNmE3ZGNiOTMiLCJVc2VybmFtZSI6IlRpYWdvIEx1aXMgUGFtcGxvbmEiLCJBY2NvdW50SWQiOiJjOTkyMDlkYS02N2Q5LTRkNTgtYjhhMy1kYTA4YmM4YTUzNjAiLCJTY2hvb2xJZCI6ImNmYjBhNDQzLWNiYzYtNDhkZC1iNjgxLTY5MTk3OGFlNWNhMSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6InNjaG9vbGFkbWluIiwic2NvcGUiOlsib3BlbmlkIiwicHJvZmlsZSJdfQ.7-D8hBTGSFddcNRBm8w7ueAYD1OjvmzBrV1nUQHpyMk5b3YGmGgLJIv8xcgg1mcZMJ0st7sle-GObQVr9GTCvBfbeGNpokpPeJBXgeLvmZa3cSktaRZ74U3fnH7Up5ns6C-45brmADVcaWN20aI4aF57nl1F8T5bMcfMwlrxQsYpAcZOWIqso-I4WJQijHVWnfOeCSKF_vL-mbUEWsSBX7gdJw-OFmqcunXs61BXcuSB5-u_BuZfg8icA8z2LCcj-J9qoEEc2SHKWsNLWCCcE-Knw_tkVk-RDDcNzFQGJCMwfxGhkf2ZagIPYLzk-hrTYqMorXrZiTgteXHxL0iVgg'; // coloque seu token aqui
const BASE_URL = 'https://prod-backoffice-api.hub.conexia.com.br/api/v1/class/';
const LOG_PATH = './actions.log';

// Função para extrair GUIDs do txt
function parseIdsFromTxt(txtPath) {
    const txt = fs.readFileSync(txtPath, 'utf8');
    // Aceita linhas com ou sem "code:"
    const regex = /(?:code:\s*)?([a-f0-9\-]{36})/gi;
    const ids = [];
    let match;
    while ((match = regex.exec(txt)) !== null) {
        ids.push(match[1]);
    }
    return ids;
}

// Função para registrar log detalhado
function writeLog(message) {
    fs.appendFileSync(LOG_PATH, message + '\n');
}

// Função principal
async function processClasses(ids) {
    for (const classCode of ids) {
        writeLog(`\n============================`);
        writeLog(`GUID do TXT: ${classCode}`);
        let classId;
        let data;
        try {
            // 1. GET no paginate (sem status=2)
            const paginateUrl = `${BASE_URL}paginate?itensPerPage=50&askPage=1&classCode=${classCode}&orderByFilter=schoolName&isDesc=false`;
            writeLog(`GET paginate: ${paginateUrl}`);
            const paginateRes = await axios.get(paginateUrl, {
                headers: {
                    Authorization: `Bearer ${AUTH_TOKEN}`
                }
            });
            const turma = paginateRes.data?.itens?.[0];
            if (!turma || !turma.classId) {
                writeLog(`Erro no GET paginate: turma não encontrada`);
                writeLog(`❌ Erro no GET paginate: ${classCode} - turma não encontrada`);
                console.log(`❌ Erro no GET paginate: ${classCode} - turma não encontrada`);
                await new Promise(resolve => setTimeout(resolve, 3000));
                continue;
            }
            classId = turma.classId;
            writeLog(`ClassId capturado: ${classId}`);
            writeLog(`✅ GET paginate OK: ${classCode} => classId: ${classId}`);
            console.log(`✅ GET paginate OK: ${classCode} => classId: ${classId}`);
        } catch (err) {
            writeLog(`Erro no GET paginate: ${err.response?.status || err.message}`);
            writeLog(`❌ Erro no GET paginate: ${classCode} - ${err.response?.status || err.message}`);
            console.log(`❌ Erro no GET paginate: ${classCode} - ${err.response?.status || err.message}`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            continue;
        }

        let getUrl = `${BASE_URL}${classId}`;
        try {
            // GET para pegar os dados completos da turma
            console.log(`🔎 Realizando GET para classId: ${classId}`);
            fs.appendFileSync(LOG_PATH, `🔎 Realizando GET para classId: ${classId}\n`);
            const getRes = await axios.get(getUrl, {
                headers: {
                    Authorization: `Bearer ${AUTH_TOKEN}`
                }
            });
            data = getRes.data;
            console.log(`✅ GET classId OK: ${classId}`);
            fs.appendFileSync(LOG_PATH, `✅ GET classId OK: ${classId}\n`);

            // Delay de 5 segundos antes do PUT
            console.log('⏳ Aguardando 5 segundos antes do PUT...');
            fs.appendFileSync(LOG_PATH, '⏳ Aguardando 5 segundos antes do PUT...\n');
            
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Monta o array de users para o PUT
            let usersAtualizados = [];
            if (Array.isArray(data.users)) {
                usersAtualizados = data.users.map(u => ({
                    userId: u.userId,
                    profileId: u.profile?.id, // CORRETO: pega o id do profile
                    itemState: 2
                }));
            }



            // Monta o body do PUT conforme seu modelo
            const putBody = {
                status: 1,
                schoolId: data.schoolId,
                segmentId: data.segment?.tagId || data.segmentId || null,
                gradeId: data.grade?.tagId || data.gradeId || null,
                courseId: data.courseId || null,
                schoolYear: data.schoolYear,
                referenceId: data.externalId,
                name: data.className,
                description: data.description,
                turnId: data.turn?.tagId || data.turnId || null,
                users: usersAtualizados,
                userId: null,
                profileId: null,
                subjects: null,
                grade: {
                    id: null,
                    itemState: 1,
                    tagId: data.grade?.tagId || data.gradeId || null
                },
                turn: {
                    id: null,
                    itemState: 1,
                    tagId: data.turn?.tagId || data.turnId || null
                },
                id: data.classId,
                licenses: []
            };

            // PUT na mesma rota
            console.log(`🚀 Realizando PUT para classId: ${classId}`);
            fs.appendFileSync(LOG_PATH, `🚀 Realizando PUT para classId: ${classId}\n`);
            fs.appendFileSync(LOG_PATH, `Body enviado no PUT:\n${JSON.stringify(putBody, null, 2)}\n`);
            const putRes = await axios.put(getUrl, putBody, {
                headers: {
                    Authorization: `Bearer ${AUTH_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });
            fs.appendFileSync(LOG_PATH, JSON.stringify(putRes.data, null, 2) + '\n');
            console.log(`✅ PUT OK para GUID: ${classCode} (classId: ${classId})`);
        } catch (err) {
            fs.appendFileSync(LOG_PATH, JSON.stringify({ error: err.response?.status || err.message, classId }, null, 2) + '\n');
            console.log(`❌ Erro no PUT: ${classId} - ${err.response?.status || err.message}`);
        }
        // Delay de 3 segundos entre cada turma
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
}

// Caminho do seu arquivo txt
const TXT_PATH = './ids.txt'; // ajuste se necessário

const ids = parseIdsFromTxt(TXT_PATH);
writeLog(`\n==== INÍCIO DO PROCESSO ====\n`);
processClasses(ids);
