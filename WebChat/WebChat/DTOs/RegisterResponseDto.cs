using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebChat.DTOs;

public class RegisterResponseDto<T>
{
    public bool IsSuccess { get; }
    public T Data { get; }
    public string? Errror { get; }
    public string? Message { get; set; }
    public RegisterResponseDto(bool IsSucess, T Data, string Error, string Message)
    {
        this.IsSuccess = IsSucess;
        this.Data = Data;
        this.Errror = Error;
        this.Message = Message;
    }
    public static RegisterResponseDto<T> Success(T Data, string? message) => new(true, Data, "", message!);
    public static RegisterResponseDto<T> Failure(string? failure) => new(false, default, failure!, "");
}