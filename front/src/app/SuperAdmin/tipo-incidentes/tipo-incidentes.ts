import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TipoIncidenteService, TipoIncidenteDTO } from '../../services/tipo-incidente.service';

@Component({
  selector: 'app-tipo-incidentes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tipo-incidentes.html',
  styleUrl: './tipo-incidentes.scss'
})
export class TipoIncidentes implements OnInit {
  tipos: TipoIncidenteDTO[] = [];
  // form
  nombre = '';
  descripcion = '';
  editingId: number | null = null;

  constructor(private tipoService: TipoIncidenteService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(){
    this.tipoService.getAll().subscribe(list => this.tipos = list || []);
  }

  startEdit(t: TipoIncidenteDTO){
    this.editingId = t.id;
    this.nombre = t.nombre || '';
    this.descripcion = t.descripcion || '';
  }

  cancelEdit(){
    this.editingId = null;
    this.nombre = '';
    this.descripcion = '';
  }

  save(){
    const payload = { nombre: this.nombre, descripcion: this.descripcion };
    if (this.editingId) {
      this.tipoService.update(this.editingId, payload).subscribe({ next: _ => { this.loadAll(); this.cancelEdit(); }, error: err => console.error(err) });
    } else {
      this.tipoService.create(payload).subscribe({ next: _ => { this.loadAll(); this.cancelEdit(); }, error: err => console.error(err) });
    }
  }

  remove(id: number){
    if (!confirm('¿Eliminar este tipo de incidente?')) return;
    this.tipoService.delete(id).subscribe({ next: _ => this.loadAll(), error: err => console.error(err) });
  }

}
