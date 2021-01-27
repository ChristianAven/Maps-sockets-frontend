import { useCallback, useEffect, useRef, useState } from "react";
import { v4 } from 'uuid'
import mapboxgl from 'mapbox-gl'
import { Subject } from "rxjs";

mapboxgl.accessToken = 'pk.eyJ1IjoiY2hyaXNhdmVuIiwiYSI6ImNra2N6ZncwYjByN2IycXFpbDA2MW4zN2kifQ.rGlf8edPqcDD2NUSU7Z-tQ';



export const useMap = (puntoInicial) => {

    const mapaDiv = useRef();
    const setRef = useCallback( (node) => {
    
        mapaDiv.current = node;

    },[])

    // referencia de los marcadores
    const marcadores = useRef({});

    // observables de Rxjs
    const movimientoMarcador = useRef( new Subject() );
    const nuevoMarcador = useRef( new Subject() ); 


    // funcion para agregar marcadores
    const  agregarMarcador = useCallback( (ev, id) => {

        const { lng, lat } = ev.lngLat || ev;
        const marker = new mapboxgl.Marker();
        marker.id = id ?? v4();

        marker.setLngLat([ lng, lat ]).addTo( mapa.current ).setDraggable( true );

        marcadores.current[marker.id] = marker;

        // si el marcador tiene ID no emitir
        if (!id) {
            nuevoMarcador.current.next( { id: marker.id,  lng, lat } );
        }

        // escuchar movimientos del marcador
        marker.on('drag', ({target}) => {
            const {id} = target; 
            const { lng, lat } = target.getLngLat();

            movimientoMarcador.current.next({id, lng, lat});    
        })

    },[])
    

    const mapa = useRef();
    const [coords, setCoords] = useState(puntoInicial)


    useEffect(() => {
        const map = new mapboxgl.Map({
            container: mapaDiv.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [ puntoInicial.lng, puntoInicial.lat ],
            zoom: puntoInicial.zoom
        });

        //setMapa(map);
        mapa.current = map;
    }, [puntoInicial]);

    //cuando se mueve el marcador
    useEffect(() => {
        mapa.current?.on('move', () =>{
            const {lng, lat} = mapa.current.getCenter()
            setCoords({
                lng: lng.toFixed(4),
                lat: lat.toFixed(4),
                zoom: mapa.current.getZoom().toFixed(2),
            })
        })

        // return mapa?.off('move');
    }, [])

    // Funcion para actualizar la ubicacion del marcador
    const actualizarPosicion = useCallback(({id, lng, lat}) =>{
        marcadores.current[id].setLngLat([lng, lat])
    },[])

    // agregar marcadores cuando se hace click
    useEffect(() => {
        mapa.current?.on('click', (ev) => agregarMarcador(ev, null))

    }, [agregarMarcador])

    return {
        coords,
        setRef, 
        agregarMarcador,
        nuevoMarcador$: nuevoMarcador.current,
        movimientoMarcador$: movimientoMarcador.current,
        actualizarPosicion,
    };

};