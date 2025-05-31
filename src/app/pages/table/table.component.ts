import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableService } from '../../services/table.service';
import { StatusService } from '../../services/status-master.service';


@Component({
  selector: 'app-table',
  imports: [CommonModule,FormsModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent implements OnInit {
  tables: any[] = [];
  statuses: any[] = [];
  isEditMode = false;
  currentTable: any = {};
  showPopup = false;
  constructor(
    private tableService:TableService,
    private statusService: StatusService
  ) {
    
  }
  ngOnInit(): void {
    this.getTables();
    this.getStatuses(); 
  }
  getTables(): void {
    this.tableService.getTables().subscribe(
      (data) => {
        console.log(data);
        this.tables = data;
      },
      (error) => {
        console.error('Error fetching tables', error);
      }
    );
  }
  getStatuses(): void {
    this.statusService.getStatuses().subscribe(
      (data) => {
        this.statuses = data;
      },
      (error) => {
        console.error('Error fetching statuses', error);
      }
    );
  }

  openAddPopup() {
    this.showPopup = true;
    this.currentTable = {};
  }

  openEditPopup(index: number) {    
    this.isEditMode = true;
    this.showPopup = true;
    this.currentTable = { ...this.tables[index] };
  }

  closePopup() {
    this.isEditMode = false;
    this.showPopup = false;    
  }

  addTable() {
    const formData = new FormData();
    formData.append('table[name]', this.currentTable.name);
    formData.append('table[capacity]', this.currentTable.capacity);
    formData.append('table[status]', this.currentTable.status);
    this.tableService.addTable(formData).subscribe(      
      (data) => {
        this.getTables();
        this.closePopup();
      },
      (error) => {
        console.error('Error adding table', error);
      }
    );
  }

  updateTable() {
    const formData = new FormData();
    formData.append('table[name]', this.currentTable.name);
    formData.append('table[capacity]', this.currentTable.capacity);
    formData.append('table[status_master_id]', this.currentTable.status_master_id);
    this.tableService.updateTable(this.currentTable.id, formData).subscribe(
      (data) => {
        this.getTables();
        this.closePopup();
      },
      (error) => {
        console.error('Error updating table', error);
      }
    );
  }
  deleteTable(index: number) {
    const tableId = this.tables[index].id;
    this.tableService.deleteTable(tableId).subscribe(
      () => {
        this.getTables();
      },
      (error) => {
        console.error('Error deleting table', error);
      }
    );
  }
      }
  

