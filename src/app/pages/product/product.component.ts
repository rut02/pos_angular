import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ProductCategoryService } from '../../services/product-category.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule,HttpClientModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  showPopup: boolean = false;
  isEditMode: boolean = false;
  currentIndex: number = -1;
  products: any[] = [];  
  currentProduct: any = {};  
  categories: any[] = [];  
  selectedImage: any;  
  showAddCategory: boolean = false;
  newCategoryName: string = '';

  // constructor เป็นฟังก์ชันพิเศษใน TypeScript/JavaScript ที่จะถูกเรียกใช้งานเมื่อมีการสร้าง instance ของ class นี้ขึ้น
  constructor(
    private router: Router, 
    private productService: ProductService,
    private productCategoryService: ProductCategoryService  
  ) {}

  // ngOnInit() มักใช้เพื่อเตรียมข้อมูลหรือเรียกข้อมูลที่จำเป็นจาก API หรือ service ก่อนที่หน้าเว็บจะแสดงผล
  ngOnInit(): void {
    this.getProducts();  
    this.getCategories();  
  }

  // subscribe ใช้สำหรับการดักฟังผลลัพธ์ (data) จาก Observable ซึ่งจะทำงานเมื่อข้อมูลพร้อมใช้งาน (เช่น การตอบกลับจาก API) หรือเกิดข้อผิดพลาด
  getProducts(): void {
    this.productService.getProducts().subscribe(
      (data) => {
        this.products = data;
      },
      (error) => {
        console.error('Error fetching products', error);
      }
    );
  }

  getCategories(): void {
    this.productCategoryService.getCategories().subscribe(
      (data) => {
        this.categories = data;
      },
      (error) => {
        console.error('Error fetching categories', error);
      }
    );
  }

  addCategory(): void {
    if (!this.newCategoryName) return; 

    this.productCategoryService.addCategory({ name: this.newCategoryName }).subscribe(
      (newCategory) => {
        this.categories.push(newCategory); 
        this.newCategoryName = '';
        this.showAddCategory = false; 
      },
      (error) => {
        console.error('Error adding category', error);
      }
    );
  }

  getCategoryNameById(categoryId: number): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'N/A';
  }

  openPopup() {
    this.showPopup = true;
    this.isEditMode = false;
    this.currentProduct = {};  
  }

  openEditPopup(index: number) {
    this.showPopup = true;
    this.isEditMode = true;
    this.currentIndex = index;
    this.currentProduct = { ...this.products[index] };  
  }

  closePopup() {
    this.showPopup = false;
  }

  addProduct(): void {
    const formData = new FormData();
    formData.append('product[name]', this.currentProduct.name);
    formData.append('product[unit_price]', this.currentProduct.unit_price);
    formData.append('product[product_category_id]', this.currentProduct.product_category_id);
    formData.append('product[description]', this.currentProduct.description);
    console.log(this.currentProduct);
    if (this.selectedImage) {
      formData.append('picture', this.selectedImage, this.selectedImage.name); 
    }

    this.productService.addProduct(formData).subscribe(
      (data) => {
        this.getProducts(); 
        this.closePopup();  
      },
      (error) => {
        console.error('Error adding product', error);
      }
    );
  }

  updateProduct(): void {
    const formData = new FormData();
    formData.append('product[name]', this.currentProduct.name);
    formData.append('product[unit_price]', this.currentProduct.unit_price);
    formData.append('product[product_category_id]', this.currentProduct.product_category_id);

    if (this.selectedImage) {
      formData.append('picture', this.selectedImage, this.selectedImage.name);
    }

    this.productService.updateProduct(this.products[this.currentIndex].id, formData).subscribe(
      (data) => {
        this.getProducts(); 
        this.closePopup();  
      },
      (error) => {
        console.error('Error updating product', error);
      }
    );
  }

  deleteProduct(index: number): void {
    const productId = this.products[index].id;
    this.productService.deleteProduct(productId).subscribe(
      () => {
        this.getProducts(); 
      },
      (error) => {
        console.error('Error deleting product', error);
      }
    );
  }

  goBack() {
    // this.router.navigate(['/settings']);
  }

  onImageUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
    }
  }
}
