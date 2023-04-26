import { useState} from 'react';
import icon from './testicon.png';
import icon2 from './testiconinvert.png';
import ModalCountdown from './ModalCountdown.js'
import { isSameDay } from "date-fns";

function AfiliadoEvent({ className, onChange, test, dia, hora, onChange2, f }) {
  const [itensArrastados, setItensArrastados] = useState([]);
  const [expandido, setExpandido] = useState(false);
  const [testM, setTestM] = useState(false);
  const [testM2, setTestM2] = useState(false);
  const itens = f;

  function handleDrop(e) {
    if (test === true) {
      setTestM(true);
      return;
    } else {
      const data = e.dataTransfer.getData('text');
  
      // verifica se a informação é uma lista de afiliados
      if (data.startsWith('[')) {
        /* console.log(lista) */
        const afiliados = JSON.parse(data);
        const novosItens = afiliados.filter((afiliado) => !itensArrastados.some((item) => item.id === afiliado.id));
        const afiliadosDisponiveis = novosItens.filter((afiliado) => {
          const [diaAfiliado ,horaAfiliado] = afiliado.diahora.split(",");
          const diaAfiliado2 = new Date(diaAfiliado);
          const diaEvento = dia.replace(/-/g, "/");
          const diaEvento2 = new Date(diaEvento); 
            if(isSameDay(diaEvento2, diaAfiliado2)){ 
              const horaAfiliado2 = new Date();
              const [HH, MM] = horaAfiliado.split(":"); // divide a string em horas e minutos
              horaAfiliado2.setHours(HH);
              horaAfiliado2.setMinutes(MM);
              horaAfiliado2.setSeconds(0); // definindo segundos como zero para ignorá-los
              const horaEvento = new Date();
              const [horas, minutos] = hora.split(":"); // divide a string em horas e minutos        
              horaEvento.setHours(horas);
              horaEvento.setMinutes(minutos);
              horaEvento.setSeconds(0); // definindo segundos como zero para ignorá-los
              const diffMs = horaAfiliado2 - horaEvento;
              const diffMin = Math.floor(diffMs / (1000 * 60));   
                    
              // condicional para comparar as horas
              if (horaAfiliado2.getHours() >= horaEvento.getHours() && diffMin <= 240) {
                return setTestM2(true);
              } else if(horaAfiliado2.getHours() <= horaEvento.getHours() && diffMin >= 240) {
                setTestM2(true);
                return setTestM2(true);
              } else{
                return true;
              }
            } else{
              return true;
            }           
        }); 
       const afiliadosDisponiveisFiltrados = afiliadosDisponiveis.filter((item) => {
          if (itens.some((id) => id === item.id)) {
            // o ID está presente em ambas as listas
            console.log('art')
            return false;
          } else {
            // o ID não está presente em ambas as listas
            console.log('josh')
            return true;
          }
        })
        setItensArrastados([...itensArrastados, ...afiliadosDisponiveisFiltrados]);
        afiliadosDisponiveisFiltrados.map((item) => {
          onChange({ target: { value: item.id } });
          onChange2({ target: { value: item.id }});
          return null;
        });  
        
      } 
      
      else { // se for apenas um afiliado
        const { id, nome, diahora } = JSON.parse(data);
        /* console.log(data); */
        const [diaAfiliado ,horaAfiliado] = diahora.split(",");
        const diaAfiliado2 = new Date(diaAfiliado);
        const diaEvento = dia.replace(/-/g, "/");
        const diaEvento2 = new Date(diaEvento); 


        if (!itensArrastados.some((item) => item.id === id)) {          
          if(isSameDay(diaEvento2, diaAfiliado2)){ 
            const horaAfiliado2 = new Date();
            const [HH, MM] = horaAfiliado.split(":"); // divide a string em horas e minutos
            horaAfiliado2.setHours(HH);
            horaAfiliado2.setMinutes(MM);
            horaAfiliado2.setSeconds(0); // definindo segundos como zero para ignorá-los
            const horaEvento = new Date();
            const [horas, minutos] = hora.split(":"); // divide a string em horas e minutos        
            horaEvento.setHours(horas);
            horaEvento.setMinutes(minutos);
            horaEvento.setSeconds(0); // definindo segundos como zero para ignorá-los
            const diffMs = horaAfiliado2 - horaEvento;
            const diffMin = Math.floor(diffMs / (1000 * 60));   
            
            
            // condicional para comparar as horas
            if (horaAfiliado2.getHours() >= horaEvento.getHours() && diffMin <= 240) {
              setTestM2(true);
              return 
            } else if(horaAfiliado2.getHours() <= horaEvento.getHours() && diffMin >= 240) {
              setTestM2(true);
              return
            } else{
              if (itens.some((item) => item === id)){
              }
              else {
                setItensArrastados([...itensArrastados, { id, nome, diahora }]);
                onChange({ target: { value: id } });
                onChange2({ target: { value: id }})
                console.log(itens)
              }
              
            }
          }
          else{
            if (itens.some((item) => item === id)){
            }
            else {
              setItensArrastados([...itensArrastados, { id, nome, diahora }]);
              onChange({ target: { value: id } });
              onChange2({ target: { value: id }})
              console.log(itens)
            }

          }
            
        }
      }
    }
  }
  

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleExpandir(e) {
    e.preventDefault();
    setExpandido(!expandido);
  }

const testing = 'Algum afiliado não foi inserido por estar ocupado neste horario';
    return (
      <>{testM && <ModalCountdown/> }
        {testM2 && <ModalCountdown ModalContent={testing} /> }
        {expandido ? ( 
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{ width: '50%', height: '280px', border: '1px solid black', overflow: 'auto', marginTop:'20px', marginLeft:'5px', backgroundColor:'white' }}
          ><span style={{ position:'fixed', marginTop:'-20px' }}>{className}</span>
            <button onClick={handleExpandir} style={{ backgroundImage: `url(${icon2})`, marginTop:'-12px',border:'1px solid black' , position:'fixed', marginLeft:'12.6%', width:'23px', height:'12px' }}>
            </button>
            <span style={{fontSize: '15px'}}>
              {itensArrastados.map((item, ) => (
                <div key={item.id}>{item.nome}</div>
              ))}
            </span> 
          </div>)
          : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              style={{  marginLeft:'5px', width: '50%', height: '180px', display: 'flex', border: '1px solid black', overflow: 'auto', marginTop:'20px', backgroundColor:'white' }}
            ><span style={{ position:'fixed', marginTop:'-20px' }}>{className}</span>
              {itensArrastados.length >= 0 && (
                <button onClick={handleExpandir} style={{ backgroundImage: `url(${icon})`, border:'1px solid black' , position:'fixed', marginLeft:'12.6%', marginTop:'9.25%', width:'23px', height:'12px' }}>
                </button>
              )}<span style={{fontSize: '15px'}}>
                {itensArrastados.map((item) => (
                  <div key={item.id}>{item.nome}</div>
                ))}
              </span> 
            </div>
          )}
      </>
    );
}

export default AfiliadoEvent;
