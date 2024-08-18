import {EventDispatcher, Vector3, Raycaster} from "three";

export class Mouse extends EventDispatcher
{

    constructor(view)
    {
        super();
        this.container = document.getElementById('threejs-container');
        this.view = view;
        this.selected_cell = null;
        document.addEventListener(
            'mousemove', this.on_mouse_move.bind(this));
        document.addEventListener(
            'click', this.on_left_click.bind(this));

        this.cells = [];
    }

    on_mouse_move(event)
    {
        var positionInfo = this.container.getBoundingClientRect();
        let mouse3D = new Vector3(
            ((event.clientX - positionInfo.left) / positionInfo.width)  * 2 - 1,   
            -((event.clientY - positionInfo.top) / positionInfo.height) * 2 + 1,  
            0.5 );
        let raycaster = new Raycaster();                                        
        raycaster.setFromCamera(mouse3D, this.view.camera);
        let intersects = raycaster.intersectObjects(
            this.cells, true);
        if (intersects.length > 0)
        {
            let selected = intersects[0].object;
            if (selected != this.selected_cell)
            {
                if (this.selected_cell != null)
                {
                    this.dispatchEvent(
                        {type: 'hover_leave', cell: this.selected_cell});
                }
                this.dispatchEvent(
                    {type: 'hover_enter', cell: selected});
                this.selected_cell = selected;
            }
        }
        else if (this.selected_cell != null)
        {
            this.dispatchEvent({
                type: 'hover_leave', cell: this.selected_cell});
            this.selected_cell = null;
        }
    }

    on_left_click(event)
    {
        this.dispatchEvent({
            type: 'left_click', cell: this.selected_cell});
        this.on_mouse_move(event);
    }

}